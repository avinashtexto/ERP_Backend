export interface DailyTask {
  pk_obt_id: number;
  task: string;
  task_date: Date;
  task_time: Date;
  remarks?: string | null;
  status: 'Pending' | 'Canceled' | 'Finished';
  priority: 'High' | 'Medium' | 'Low';
  fk_ob_id: number;
}

export interface CreateDailyTaskDto {
  task: string;
  task_date: Date;
  task_time: Date;
  remarks?: string | null | undefined;
  status: 'Pending' | 'Canceled' | 'Finished';
  priority?: 'High' | 'Medium' | 'Low';
  fk_ob_id: number;
}

export interface UpdateDailyTaskDto {
  task?: string;
  task_date?: Date;
  task_time?: Date;
  remarks?: string;
  status?: 'Pending' | 'Canceled' | 'Finished';
  priority?: 'High' | 'Medium' | 'Low';
  fk_ob_id?: number;
}
