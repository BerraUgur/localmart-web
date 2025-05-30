import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/comment';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user-update.component.html',
  styleUrl: './user-update.component.css'
})
export class UserUpdateComponent {
  userForm: FormGroup;
  userId?: number;

  private toastr = inject(ToastrService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: AuthService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.userService.getUser(this.userId).subscribe(
      (user: User) => {
        this.userForm.patchValue(user);
      },
      error => {
        console.error('Error fetching user details', error);
      }
    );
  }

  updateUser() {
    if (this.userForm.valid) {
      this.userService.updateUser(this.userId!, this.userForm.value).subscribe(
        response => {
          console.log('User updated successfully', response);
          this.router.navigate(['/user-list']).then(c=>{
            this.toastr.success(`Kullanıcı Güncellenmiştir`)
          });
        },
        error => {
          console.error('Error updating user', error);
        }
      );
    }
  }
}
