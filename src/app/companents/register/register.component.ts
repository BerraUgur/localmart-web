import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../services/registerRequest';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  phoneNumber : string = '';
  
  private toastr = inject(ToastrService);
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  register() {
    if (this.username === '' || this.email === '' || this.password === '' || this.firstName === '' || this.lastName === '' || this.phoneNumber === '') {
      this.toastr.error('Lütfen tüm alanları doldurunuz')
      return
    }
    
    const registerRequest: RegisterRequest = { email: this.email, password: this.password, firstName: this.firstName, lastName: this.lastName, phoneNumber: this.phoneNumber, username: this.username };
    this.authService.Register(registerRequest).subscribe(
      data => {
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Login failed', error);
      }
    );
  }
}
