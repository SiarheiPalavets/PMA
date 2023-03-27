import { BoardsService } from 'src/app/shared/services/boards.service';
import { BoardInterface } from './../../../../shared/types/board.interface';
import { TaskService } from 'src/app/shared/services/task.service';
import { ColumnInterface } from 'src/app/shared/types/column.interfacec';
import { FormBuilder } from '@angular/forms';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { BoardService } from './../../../services/board.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ColumnsService } from 'src/app/shared/services/columns.service';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
})
export class TaskModalComponent implements OnInit, OnDestroy {
  boardId!: string;
  taskId!: string;
  columnId!: string | null;
  task$: Observable<TaskInterface>;
  data$: Observable<{
    task: TaskInterface;
    columns: ColumnInterface[];
    board: BoardInterface;
  }>;

  columnForm = this.fb.group({
    columnId: [''],
    title: [''],
  });

  unsubscribe$ = new Subject<void>();
  @HostBinding('class') classes = 'task-modal';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardSvc: BoardService,
    private fb: FormBuilder,
    private tasksSvc: TaskService,
    private translate: TranslateService,
    private columnsSvc: ColumnsService,
    private boardsSvc: BoardsService
  ) {
    this.route.parent?.params.subscribe((id: Params) => {
      this.boardId = id['boardId'];
    });

    this.route.params.subscribe((id: Params) => {
      this.taskId = id['taskId'];
    });

    if (!this.boardId) {
      throw new Error('Can´t get boardID from URL');
    }
    if (!this.taskId) {
      throw new Error('Can´t get taskID from URL');
    }

    this.task$ = this.boardSvc.tasks$.pipe(
      map((tasks) => {
        return tasks.find((task) => task._id === this.taskId);
      }),
      filter(Boolean)
    );

    this.data$ = combineLatest([
      this.task$,
      this.boardSvc.columns$,
      this.boardSvc.baord$.pipe(filter(Boolean)),
    ]).pipe(
      map(([task, columns, board]) => ({
        task,
        columns,
        board,
      }))
    );

    this.task$.pipe(takeUntil(this.unsubscribe$)).subscribe((task) => {
      this.columnForm.patchValue({
        columnId: task.columnId,
      });
    });

    combineLatest([
      this.task$,
      this.columnForm.get('columnId')!.valueChanges,
      this.boardSvc.baord$,
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([task, columnId, board]) => {
        if (task.columnId !== columnId) {
          this.tasksSvc.updateTask(
            this.boardId,
            task._id,
            columnId!,
            board?.owner!
          );
        }
      });
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('en');
    this.translate.setDefaultLang('en');
    const lang = localStorage.getItem('lang');
    if (lang) {
      this.translate.use(lang);
    }
  }

  goToBoard(): void {
    this.router.navigate(['boards', this.boardId]);
  }

  updateTaskName(taskName: string, userId: any, description: string): void {
    const columnId = this.columnForm.get('columnId')?.value;
    this.tasksSvc
      .updateTask(
        this.boardId,
        this.taskId,
        columnId!,
        userId,
        taskName,
        description
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: any) => {
        this.tasksSvc
          .getTasks(this.boardId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((tasks) => {
            this.boardSvc.setTask(tasks);
          });
      });
  }

  deleteTask(boardId: string, columnId: string, taskId: string) {
    if (confirm('Are you sure you want to delete this task???')) {
      this.tasksSvc.deleteTask(boardId, columnId, taskId).subscribe((res) => {
        this.tasksSvc
          .getTasks(this.boardId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((tasks) => {
            this.boardSvc.setTask(tasks);
            this.goToBoard();
          });
      });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
