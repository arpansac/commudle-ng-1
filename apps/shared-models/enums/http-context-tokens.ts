import { HttpContextToken } from '@angular/common/http';

export const SKIP_ERROR_404 = new HttpContextToken<boolean>(() => false);
