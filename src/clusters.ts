import * as cluster from 'cluster';
import { CpuInfo, cpus } from 'os';

class Clusters {
  private cpus: CpuInfo[];
  constructor() {
    this.cpus = cpus();
    this.init();
  }
  public init(): void {
    if (cluster.isMaster) {
      
      this.cpus.forEach(() => cluster.fork());

      cluster.on('listening', worker => {
        console.log(`Cluster ${worker.process.pid} connected :)`);
      });
      
      cluster.on('disconnect', worker => {
        console.log(`Cluster ${worker.process.pid} disconnected :(`);
      });

      cluster.on('exit', worker => {
        console.log(`Cluster ${worker.process.pid} exited :(`);
        cluster.fork();
      });
    } else {
      require('./index');
    }
  }
}

export default new Clusters();
