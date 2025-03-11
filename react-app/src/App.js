// App.js
import React, { useEffect, useState } from 'react';
import { trace, propagation, context } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Exporter 설정
const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
  headers: {},
});
exporter.export = (spans, resultCallback) => {
  console.log('Exporting spans:', spans.map(s => s.name));
  OTLPTraceExporter.prototype.export.call(exporter, spans, (result) => {
    if (result.error) console.error('Trace export failed:', result.error);
    else console.log('Trace export succeeded');
    resultCallback(result);
  });
};

// Provider 설정
const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'react-app',
  }),
});
provider.addSpanProcessor(
  new BatchSpanProcessor(exporter, {
    maxQueueSize: 1000,
    scheduledDelayMillis: 1000,
  })
);
window.addEventListener('beforeunload', () => {
  provider.activeSpanProcessor.forceFlush().then(() => console.log('Spans flushed'));
});

// Instrumentation 등록
try {
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/http:\/\/localhost:8080\/api\/.*/],
      }),
    ],
  });
  provider.register();
} catch (error) {
  console.error('OpenTelemetry 초기화 오류:', error);
}

const tracer = trace.getTracer('react-app');

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const span = tracer.startSpan('fetch-data');
    console.log('Span started:', span);
    const currentContext = trace.setSpan(context.active(), span);
    const headers = {};
    propagation.inject(currentContext, headers);
    console.log('Trace headers:', headers);

    fetch('http://localhost:8080/api/users', {
      headers: headers,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.text();
      })
      .then((data) => setData(data))
      .catch((err) => setError(err))
      .finally(() => {
        span.end();
        console.log('Span ended:', span);
      });
  }, []);

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;
  return <div>Data: {data}</div>;
}

export default App;
