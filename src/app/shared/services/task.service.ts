import { TaskInterface } from './../types/task.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable()
export class TaskService {
  constructor(private http: HttpClient) {}

  getTask(
    boardId: string,
    columnId: string,
    taskId: string
  ): Observable<TaskInterface[]> {
    const url = `${environment.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`;
    return this.http.get<TaskInterface[]>(url);
  }

  getTasks(boardId: string): Observable<TaskInterface[]> {
    const url = `${environment.apiUrl}/tasksSet/${boardId}`;
    return this.http.get<TaskInterface[]>(url);
  }

  createTask(
    boardId: string,
    columnId: string,
    title: string,
    userId: string
  ): Observable<TaskInterface> {
    const url = `${environment.apiUrl}/boards/${boardId}/columns/${columnId}/tasks`;

    return this.http.post<TaskInterface>(url, {
      title,
      userId,
      order: 0,
      description: 'default',
      users: ['default'],
    });
  }

  updateTask(
    boardId: string,
    taskId: string,
    columnId: string,
    userId: string,
    title?: string,
    description?: string
  ): Observable<TaskInterface> {
    const url = `${environment.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`;
    return this.http.put<TaskInterface>(url, {
      title,
      order: 0,
      description,
      columnId,
      userId,
      users: [''],
    });
  }

  deleteTask(
    boardId: string,
    columnId: string,
    taskId: string
  ): Observable<TaskInterface> {
    const url = `${environment.apiUrl}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`;
    return this.http.delete<TaskInterface>(url);
  }
}
