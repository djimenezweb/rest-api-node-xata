import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getXataClient, Job } from './xata';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const xata = getXataClient();

type DataOrErrorResponse<T> = { error: string } | { data: T };

app.get('/api/jobs', async (req: Request, res: Response<DataOrErrorResponse<Job[]>>) => {
  try {
    const jobs = await xata.db.job.getMany();
    return res.status(200).json({ data: jobs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/jobs', async (req: Request<{}, {}, Job>, res: Response<DataOrErrorResponse<Job>>) => {
  try {
    const job = req.body;
    const createdJob = await xata.db.job.create(job);
    return res.status(201).json({ data: createdJob });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

app.put('/api/jobs/:id', async (req: Request<{ id: string }, {}, Job>, res: Response<DataOrErrorResponse<Job>>) => {
  try {
    const { id } = req.params;
    const job = req.body;
    const updatedJob = await xata.db.job.update(id, job);
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json({ data: updatedJob });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

app.delete('/api/jobs/:id', async (req: Request<{ id: string }, {}, {}>, res: Response<DataOrErrorResponse<Job>>) => {
  try {
    const { id } = req.params;
    const deletedJob = await xata.db.job.delete(id);
    if (!deletedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json({ data: deletedJob });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => console.log('Server running at port ' + port));
