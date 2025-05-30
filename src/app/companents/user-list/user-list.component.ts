import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Role, User } from '../../services/comment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  Role:any | Role;
  nousers: boolean = false;
  private toastr = inject(ToastrService);
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getUserList().subscribe(
      (data: User[]) => {
        this.users = data;
        console.log('Users fetched successfully', data);
      },
      error => {
        this.toastr.success('Error fetching users', error)
      }
    );
  }

  deleteUser(userId: number) {
    this.authService.deleteUser(userId).subscribe(
      () => {
        let deletedUser = this.users?.find(user => user.id == userId)
        this.toastr.success(`${deletedUser?.firstName} ${deletedUser?.lastName} Kullanıcısı Silinmiştir`)

        this.users = this.users?.filter(user => user.id !== userId);
      },
      error => {
        console.error('Error deleting user:', error);
      }
    );
  }
}
