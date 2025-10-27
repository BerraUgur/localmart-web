import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LoggerService {
    private apiUrl = 'http://localhost:5203/logs';

    constructor(private http: HttpClient) { }

    log(level: string, message: string, details?: any) {
        const userType = localStorage.getItem('userType') || 'anonymous';
        const ip = sessionStorage.getItem('clientIp') || 'unknown';
        const userAgent = navigator.userAgent || '';
        const log = {
            level,
            message,
            details: details ? JSON.stringify(details) : '',
            timestamp: new Date().toISOString(),
            user: null,
            userType,
            ip,
            exception: '',
            stackTrace: '',
            endpoint: window.location.pathname || '',
            userAgent
        };
        this.http.post(this.apiUrl, log).subscribe();
    }

    logError(message: string, details?: any) {
        this.log('Error', message, details);
    }

    logInfo(message: string, details?: any) {
        this.log('Info', message, details);
    }

    logDebug(message: string, details?: any) {
        this.log('Debug', message, details);
    }

    logWarn(message: string, details?: any) {
        this.log('Warn', message, details);
    }
}
