# Import Guidelines

## Nebular Imports

- Always import Nebular components from `@commudle/theme`.
- Never import directly from `@nebular/theme`.

```typescript
// ✅ Correct
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { NbToastrService, NbIconModule } from '@commudle/theme';

// ❌ Wrong
import { NbDialogRef } from '@nebular/theme';
```

## Shared Library Imports

- Always use barrel exports from `@commudle/shared-services` and
  `@commudle/shared-models`.
- Never import directly from `libs/shared/services/src/lib/...` or
  `libs/shared/models/src/lib/...`.

```typescript
// ✅ Correct
import { HackathonTeamRoundSubmissionService, AuthService } from '@commudle/shared-services';
import { ICommunityBuild, EBuildType } from '@commudle/shared-models';

// ❌ Wrong
import { HackathonTeamRoundSubmissionService } from 'libs/shared/services/src/lib/hackathon-team-round-submission.service';
import { ICommunityBuild } from 'libs/shared/models/src/lib/community-build.model';
```

## Import Organization Order

```typescript
// 1. Angular core
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// 2. Third-party (including @commudle/theme)
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { faCircleCheck, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, finalize } from 'rxjs';

// 3. Application imports (models, services, components)
import { ICommunityBuild, EBuildType } from '@commudle/shared-models';
import { AuthService, ToastrService } from '@commudle/shared-services';
```
