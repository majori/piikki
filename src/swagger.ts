import * as path from 'path';
import { Router, static as serveStatic } from 'express';

export default function (cfg) {
    const swagger = Router();

    // Path to swagger-ui
    const dist = path.join(__dirname, '..', 'lib', 'swagger-ui');

    // Path to documents
    const docs = path.join(__dirname, '..', 'docs');

    swagger.get('/api-docs.json', (req, res) => {
        res.sendFile(path.join(docs, 'api-docs.json'));
    });

    swagger.use('/ui', serveStatic(dist));
    swagger.get('/ui', (req, res) => {
        res.sendFile(path.join(dist, 'index.html'));
    })

    return swagger;
}
