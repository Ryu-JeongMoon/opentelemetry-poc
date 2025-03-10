import React, { useEffect } from 'react';
import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const provider = new WebTracerProvider();
provider.register({
    exporter: new OTLPTraceExporter({
        url: 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [new FetchInstrumentation()],
});
const tracer = trace.getTracer('react-app');

function App() {
    useEffect(() => {
        const span = tracer.startSpan('fetch-data');
        fetch('http://localhost:8080/api/users')
            .then(res => res.json())
            .then(data => console.log(data))
            .finally(() => span.end());
    }, []);

    return <div>Check Grafana!</div>;
}

export default App;
