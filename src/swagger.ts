import * as path from 'path';
import * as fs from 'fs-extra';
import * as swaggerUI from 'swagger-ui-dist';
import { Router, static as serveStatic } from 'express';

export default function(cfg: any) {
  const swagger = Router();

  // Path to swagger-ui
  const dist = swaggerUI.getAbsoluteFSPath();

  swagger.get('/api-docs.json', (req, res) => {
    res.sendFile(path.join(cfg.dir.documents, 'api-docs.json'));
  });

  swagger.get('/ui', async (req, res) => {
    // Load swagger default index.html as text
    const original = await fs.readFile(path.join(dist, 'index.html'), 'utf8');

    // Replace placeholder url
    const html = original.replace('http://petstore.swagger.io/v2/swagger.json', '/swagger/api-docs.json');

    // Send modified index.html
    res.send(html);
  });

  // Serve rest of the swagger assets
  swagger.use('/ui', serveStatic(dist));

  return swagger;
}
