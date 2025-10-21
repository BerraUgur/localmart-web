import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/comment';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-update.component.html',
  styleUrl: './user-update.component.css'
})

export class UserUpdateComponent {
  userForm: FormGroup;
  userId?: number;

  private toastr = inject(ToastrService);
  private logger = inject(LoggerService);

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
    // Fetch user details by id
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.logger.info('Fetching user details', this.userId);
    this.userService.getUser(this.userId).subscribe(
      (user: User) => {
        this.userForm.patchValue(user);
        this.logger.info('User details fetched', user);
      },
      error => {
        this.toastr.error('Error fetching user details');
        this.logger.error('Error fetching user details', error);
      }
    );
  }

  // Update user details
  updateUser() {
    if (this.userForm.valid) {
      this.logger.info('Updating user', this.userId, this.userForm.value);
      this.userService.updateUser(this.userId!, this.userForm.value).subscribe(
        () => {
          this.toastr.success('User has been updated');
          this.logger.info('User updated successfully', this.userId);
          this.router.navigate(['/user-list']);
        },
        error => {
          this.toastr.error('Error updating user');
          this.logger.error('Error updating user', error);
        }
      );
    }
  }
}
