import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Role, User } from '../../models/comment';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})

export class UserListComponent implements OnInit {
  users: User[] = [];
  Role: any | Role;
  noUsers: boolean = false;
  private toastr = inject(ToastrService);
  private logger = inject(LoggerService);
  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Fetch all users
    this.authService.getUserList().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      error => {
        this.toastr.error('Error fetching users');
        this.logger.logError('Error fetching users', error);
      }
    );
  }

  // Delete user by id
  deleteUser(userId: number) {
    this.authService.deleteUser(userId).subscribe(
      () => {
        const deletedUser = this.users?.find(user => user.id === userId);
        this.toastr.success(`${deletedUser?.firstName} ${deletedUser?.lastName} has been deleted`);
        this.users = this.users?.filter(user => user.id !== userId);
      },
      error => {
        this.toastr.error('Error deleting user');
        this.logger.logError('Error deleting user', error);
      }
    );
  }
}
