import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Play, Eye, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PurchasedItem {
  id: string;
  asset_id: string;
  rights: string[];
  expires_at: string | null;
  created_at: string;
  tokenqube_id: string | null;
  content_items: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    slug: string;
    media_assets: Array<{
      id: string;
      storage_path: string | null;
      external_url: string | null;
      kind: string;
    }>;
  } | null;
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchPurchases();
  }, [user, navigate]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("entitlements")
        .select(`
          id,
          asset_id,
          rights,
          expires_at,
          created_at,
          tokenqube_id,
          content_items!asset_id (
            id,
            title,
            description,
            type,
            slug,
            media_assets (
              id,
              storage_path,
              external_url,
              kind
            )
          )
        `)
        .eq("holder_user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPurchases(data as any || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast({
        title: "Error",
        description: "Failed to load your purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccess = async (purchase: PurchasedItem) => {
    if (!purchase.rights.includes("download") && !purchase.rights.includes("stream")) {
      toast({
        title: "Access Restricted",
        description: "Your entitlement doesn't include download or streaming rights",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the aa-entitlements edge function to get signed URL
      const { data, error } = await supabase.functions.invoke(
        `aa-entitlements/${purchase.asset_id}`,
        { method: "GET" }
      );

      if (error) throw error;

      if (data?.has_access && data?.url) {
        // Open the signed URL
        window.open(data.url, "_blank");
      } else {
        toast({
          title: "Access Denied",
          description: "Unable to access this content",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accessing content:", error);
      toast({
        title: "Error",
        description: "Failed to access content",
        variant: "destructive",
      });
    }
  };

  const getRightsIcon = (right: string) => {
    switch (right) {
      case "view":
        return <Eye className="h-3 w-3" />;
      case "stream":
        return <Play className="h-3 w-3" />;
      case "download":
        return <Download className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Purchases</h1>
            <p className="text-muted-foreground">
              Access your purchased content and manage your entitlements
            </p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No purchases yet</h2>
              <p className="text-muted-foreground mb-6">
                Browse content and make your first purchase
              </p>
              <Button onClick={() => navigate("/app")}>
                Browse Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => {
              const contentItem = purchase.content_items;
              
              const isExpired = purchase.expires_at 
                ? new Date(purchase.expires_at) < new Date() 
                : false;

              return (
                <Card key={purchase.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {contentItem?.title || "Untitled Content"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {contentItem?.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {purchase.rights.map((right) => (
                        <Badge key={right} variant="secondary" className="gap-1">
                          {getRightsIcon(right)}
                          {right}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Purchased {format(new Date(purchase.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                      {purchase.expires_at && (
                        <div className="flex items-center gap-2">
                          <Badge variant={isExpired ? "destructive" : "outline"}>
                            {isExpired ? "Expired" : "Active"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {isExpired ? "Expired" : "Expires"}{" "}
                            {format(new Date(purchase.expires_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                      {!purchase.expires_at && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Lifetime Access
                        </Badge>
                      )}
                    </div>

                    {!isExpired && (
                      <Button
                        className="w-full"
                        onClick={() => handleAccess(purchase)}
                        disabled={
                          !purchase.rights.includes("download") &&
                          !purchase.rights.includes("stream")
                        }
                      >
                        {purchase.rights.includes("download") ? (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        ) : purchase.rights.includes("stream") ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Stream
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </>
                        )}
                      </Button>
                    )}

                    {purchase.tokenqube_id && (
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        Token: {purchase.tokenqube_id}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
