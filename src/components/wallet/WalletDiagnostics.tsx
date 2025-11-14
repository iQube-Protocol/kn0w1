import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  endpoint: string;
  resolvedUrl: string;
  status: 'success' | 'error' | 'warning';
  statusCode?: number;
  responseTime?: number;
  errorMessage?: string;
  timestamp: string;
}

export function WalletDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [];

    // Test aa-auth-challenge
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('aa-auth-challenge', {
        body: { did: 'did:kn0w1:test' }
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        newResults.push({
          endpoint: 'aa-auth-challenge',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-challenge`,
          status: 'error',
          responseTime,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        });
      } else if (data?.error) {
        // Expected error for test DID, but endpoint is reachable
        newResults.push({
          endpoint: 'aa-auth-challenge',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-challenge`,
          status: 'warning',
          statusCode: 200,
          responseTime,
          errorMessage: 'Endpoint reachable (test DID rejected as expected)',
          timestamp: new Date().toISOString()
        });
      } else {
        newResults.push({
          endpoint: 'aa-auth-challenge',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-challenge`,
          status: 'success',
          statusCode: 200,
          responseTime,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      newResults.push({
        endpoint: 'aa-auth-challenge',
        resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-challenge`,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Test aa-auth-verify
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('aa-auth-verify', {
        body: { jws: 'test.jws.signature' }
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        newResults.push({
          endpoint: 'aa-auth-verify',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-verify`,
          status: 'error',
          responseTime,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        });
      } else if (data?.error) {
        // Expected error for test JWS, but endpoint is reachable
        newResults.push({
          endpoint: 'aa-auth-verify',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-verify`,
          status: 'warning',
          statusCode: 200,
          responseTime,
          errorMessage: 'Endpoint reachable (test JWS rejected as expected)',
          timestamp: new Date().toISOString()
        });
      } else {
        newResults.push({
          endpoint: 'aa-auth-verify',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-verify`,
          status: 'success',
          statusCode: 200,
          responseTime,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      newResults.push({
        endpoint: 'aa-auth-verify',
        resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aa-auth-verify`,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Test gateway-quotes
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('gateway-quotes', {
        body: { chain: 'polygon', size_usd: 10 }
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        newResults.push({
          endpoint: 'gateway-quotes',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gateway-quotes`,
          status: 'error',
          responseTime,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        });
      } else {
        newResults.push({
          endpoint: 'gateway-quotes',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gateway-quotes`,
          status: 'success',
          statusCode: 200,
          responseTime,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      newResults.push({
        endpoint: 'gateway-quotes',
        resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gateway-quotes`,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Test gateway-intent
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('gateway-intent', {
        body: { 
          quote_id: 'test-quote-id',
          from_address: 'test-address',
          from_chain: 'polygon'
        }
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        newResults.push({
          endpoint: 'gateway-intent',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gateway-intent`,
          status: 'error',
          responseTime,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        });
      } else if (data?.error) {
        // Expected error for test data, but endpoint is reachable
        newResults.push({
          endpoint: 'gateway-intent',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gateway-intent`,
          status: 'warning',
          statusCode: 200,
          responseTime,
          errorMessage: 'Endpoint reachable (test data rejected as expected)',
          timestamp: new Date().toISOString()
        });
      } else {
        newResults.push({
          endpoint: 'gateway-intent',
          resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gateway-intent`,
          status: 'success',
          statusCode: 200,
          responseTime,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      newResults.push({
        endpoint: 'gateway-intent',
        resolvedUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gateway-intent`,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Diagnostics</CardTitle>
        <CardDescription>
          Test wallet authentication and gateway endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running diagnostics...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Diagnostics
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.endpoint}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>

                <div className="text-sm space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Endpoint:</span>
                    <span className="font-mono text-xs">{result.resolvedUrl}</span>
                  </div>
                  
                  {result.statusCode && (
                    <div className="flex justify-between">
                      <span>Status Code:</span>
                      <span className="font-mono">{result.statusCode}</span>
                    </div>
                  )}
                  
                  {result.responseTime !== undefined && (
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span className="font-mono">{result.responseTime}ms</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span className="font-mono text-xs">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {result.errorMessage && (
                    <div className="pt-2 border-t">
                      <span className="block mb-1">Message:</span>
                      <span className="block text-xs font-mono bg-muted p-2 rounded break-all">
                        {result.errorMessage}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
