import { DataSource, Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(private dataSource: DataSource) {
    super(File, dataSource.createEntityManager());
  }
}
