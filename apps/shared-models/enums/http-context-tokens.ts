import { HttpContextToken } from '@angular/common/http';

export const EHttpContextFlag = {
  SKIP_ERROR_404: new HttpContextToken<boolean>(() => false),
};
