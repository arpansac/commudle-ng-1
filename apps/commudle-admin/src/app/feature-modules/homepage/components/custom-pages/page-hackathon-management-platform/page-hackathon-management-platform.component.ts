import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { APP_SHOWCASE_STATS, SeoService } from '@commudle/shared-services';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { SharedComponentsModule as LibSharedComponentsModule } from '@commudle/shared-components';
import { IFaq } from '@commudle/shared-models';
import { NbButtonModule, NbTabsetModule } from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faRocket,
  faUsers,
  faTrophy,
  faChartLine,
  faCode,
  faUserPlus,
  faBullhorn,
  faBuilding,
  faGraduationCap,
  faChartBar,
  faCogs,
  faHeadset,
  faClipboardList,
  faDollarSign,
  faMousePointer,
  faHashtag,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { RouterModule } from '@angular/router';
import { animate, inView } from 'motion';
import { Camera, Color, Geometry, Mesh, Polyline, Program, Renderer, Transform, Vec3 } from 'ogl';

interface HeroStatConfig {
  label: string;
  target: number;
  format: 'compact' | 'percentage';
}

interface GlobeLocation {
  lat: number;
  lng: number;
  label: string;
}

interface GlobeProjectCard {
  title: string;
  category: string;
  hotspotIndex: number;
  scaleOffset: number;
}

interface GlobeSceneState {
  renderer: Renderer;
  scene: Transform;
  camera: Camera;
  globeGroup: Transform;
  lines: Polyline[];
  hotspotPoints: Vec3[];
}

interface AudienceFeatureCard {
  icon: typeof faRocket;
  title: string;
  description: string;
}

interface AudienceFeatureGroup {
  title: string;
  description: string;
  cards: AudienceFeatureCard[];
}

interface TimelineFeature {
  icon: typeof faRocket;
  title: string;
  desc: string;
}

interface TimelineStage {
  id: 'plan' | 'register' | 'build' | 'judge' | 'win';
  emoji: string;
  label: string;
  title: string;
  description: string;
  features: TimelineFeature[];
}

interface TimelineChecklistItem {
  label: string;
  complete: boolean;
}

interface TimelineParticipantCard {
  initials: string;
  name: string;
  skill: string;
}

interface TimelineBuildProject {
  name: string;
  category: string;
  progressLabel: string;
  progressClass: string;
}

interface TimelineJudgeScore {
  value: string;
  tone: 'strong' | 'medium' | 'light';
}

interface TimelineJudgeProject {
  name: string;
  scores: TimelineJudgeScore[];
}

const HERO_GLOBE_VERTEX = /* glsl */ `
  precision highp float;

  attribute vec3 position;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uPointSize;

  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize * (1.0 / max(0.8, -mvPosition.z * 0.24));
    vAlpha = smoothstep(-4.8, -1.2, mvPosition.z);
  }
`;

const HERO_GLOBE_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;

  varying float vAlpha;

  void main() {
    vec2 centered = gl_PointCoord.xy - vec2(0.5);
    float strength = smoothstep(0.5, 0.08, length(centered));
    gl_FragColor = vec4(uColor, strength * vAlpha);
  }
`;

const HERO_ARC_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

@Component({
  selector: 'commudle-page-hackathon-management-platform',
  standalone: true,
  imports: [
    CommonModule,
    SharedComponentsModule,
    LibSharedComponentsModule,
    NbButtonModule,
    NbTabsetModule,
    FontAwesomeModule,
    RouterModule,
  ],
  templateUrl: './page-hackathon-management-platform.component.html',
  styleUrls: ['./page-hackathon-management-platform.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHackathonManagementPlatformComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly isBrowser: boolean;
  private cleanupFns: Array<() => void> = [];
  private counterAnimations: Array<{ stop: () => void }> = [];
  private animationFrameId?: number;
  private projectCardTimer?: number;
  private timelineAutoAdvanceTimer?: number;
  private heroCountersStarted = false;
  private statsBandCountersStarted = false;
  private activeProjectCardIndex = 0;
  activeTimelineStageIndex = 0;
  private globeState?: GlobeSceneState;
  private isGlobeDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private globeRotationX = 0.24;
  private globeRotationY = -0.35;
  private globeVelocityX = 0;
  private globeVelocityY = 0;

  @ViewChild('heroSection', { static: false }) heroSection?: ElementRef<HTMLElement>;
  @ViewChild('heroContent', { static: false }) heroContent?: ElementRef<HTMLElement>;
  @ViewChild('heroVisual', { static: false }) heroVisual?: ElementRef<HTMLElement>;
  @ViewChild('statsSection', { static: false }) statsSection?: ElementRef<HTMLElement>;
  @ViewChild('statsContent', { static: false }) statsContent?: ElementRef<HTMLElement>;
  @ViewChild('featuresSection', { static: false }) featuresSection?: ElementRef<HTMLElement>;
  @ViewChild('featuresContent', { static: false }) featuresContent?: ElementRef<HTMLElement>;
  @ViewChild('timelineSection', { static: false }) timelineSection?: ElementRef<HTMLElement>;
  @ViewChild('timelineContent', { static: false }) timelineContent?: ElementRef<HTMLElement>;
  @ViewChild('globeCanvas', { static: false }) globeCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('globeWrap', { static: false }) globeWrap?: ElementRef<HTMLDivElement>;
  @ViewChildren('hotspotElement') hotspotElements?: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('projectCardElement') projectCardElements?: QueryList<ElementRef<HTMLDivElement>>;

  readonly icons = {
    faRocket,
    faUsers,
    faTrophy,
    faChartLine,
    faCode,
    faUserPlus,
    faBullhorn,
    faBuilding,
    faGraduationCap,
    faChartBar,
    faCogs,
    faHeadset,
    faClipboardList,
    faDollarSign,
    faHashtag,
    faTarget: faMousePointer,
    faCheck,
  };
  readonly appShowcaseStats = APP_SHOWCASE_STATS;
  readonly heroStats: HeroStatConfig[] = [
    {
      label: 'Developers',
      target: 300000,
      format: 'compact',
    },
    {
      label: 'Community members',
      target: 600000,
      format: 'compact',
    },
    {
      label: 'Hackathon success rate',
      target: 100,
      format: 'percentage',
    },
  ];
  readonly statsBandStats: HeroStatConfig[] = [
    {
      label: 'Developers',
      target: 300000,
      format: 'compact',
    },
    {
      label: 'Community members',
      target: 600000,
      format: 'compact',
    },
    {
      label: 'Hackathon success rate',
      target: 100,
      format: 'percentage',
    },
  ];
  readonly featureAudienceGroups: AudienceFeatureGroup[] = [
    {
      title: 'For organizers',
      description: 'Orchestrate registrations, evaluations, and reporting without stitching together multiple tools.',
      cards: [
        {
          icon: faUserPlus,
          title: 'Smart registration workflows',
          description:
            'Collect the right information, shortlist applicants, and manage solo or team entries with ease.',
        },
        {
          icon: faClipboardList,
          title: 'Judging and evaluation ops',
          description:
            'Assign mentors and judges, configure scorecards, and keep every round structured from one dashboard.',
        },
        {
          icon: faChartLine,
          title: 'Live reporting and insights',
          description:
            'Monitor registrations, submissions, engagement, and outcomes with analytics built for community programs.',
        },
      ],
    },
    {
      title: 'For participants',
      description: 'Give builders a smoother experience from joining the hackathon to submitting their final project.',
      cards: [
        {
          icon: faUsers,
          title: 'Team formation tools',
          description:
            'Support individual and team registrations with teammate management built directly into the workflow.',
        },
        {
          icon: faCode,
          title: 'Structured project submissions',
          description:
            'Collect project links, decks, updates, and final deliverables in one consistent submission experience.',
        },
        {
          icon: faHeadset,
          title: 'Mentor and support touchpoints',
          description:
            'Keep participants connected to organizers, mentors, and critical communications throughout the event.',
        },
      ],
    },
    {
      title: 'For sponsors',
      description:
        'Turn sponsorship into a measurable brand experience with better reach, visibility, and follow-up data.',
      cards: [
        {
          icon: faBullhorn,
          title: 'Targeted brand visibility',
          description:
            'Promote sponsored tracks and campaigns to active developer communities already primed to participate.',
        },
        {
          icon: faDollarSign,
          title: 'Prize and reward storytelling',
          description:
            'Highlight prizes, tracks, and sponsor value clearly across the registration and project journey.',
        },
        {
          icon: faChartBar,
          title: 'ROI-focused analytics',
          description: 'Measure registrations, engagement, and community growth with richer audience-level reporting.',
        },
      ],
    },
  ];
  readonly timelineStages: TimelineStage[] = [
    {
      id: 'plan',
      emoji: '🎯',
      label: 'Plan',
      title: 'Set up in minutes',
      description:
        'Launch the structure of your hackathon with branding, registrations, prize tracks, and evaluation flows configured in one place.',
      features: [
        {
          icon: faClipboardList,
          title: 'Registration and track setup',
          desc: 'Configure forms, deadlines, tracks, and prizes without stitching together multiple tools.',
        },
        {
          icon: faBullhorn,
          title: 'Branded public launch page',
          desc: 'Publish a polished hackathon page that clearly explains the challenge, timeline, and rewards.',
        },
        {
          icon: faCogs,
          title: 'Mentor and judge preparation',
          desc: 'Invite reviewers, define scorecards, and align your internal team before registrations open.',
        },
      ],
    },
    {
      id: 'register',
      emoji: '👥',
      label: 'Register',
      title: 'Registrations open',
      description:
        'As participants start joining, your team can review applicants, support team formation, and keep communication flowing smoothly.',
      features: [
        {
          icon: faUserPlus,
          title: 'Application review pipeline',
          desc: 'Track incoming registrations, shortlist faster, and keep your intake process organized end to end.',
        },
        {
          icon: faUsers,
          title: 'Team formation support',
          desc: 'Let builders collaborate while organizers retain visibility into every individual and team entry.',
        },
        {
          icon: faRocket,
          title: 'Automated participant updates',
          desc: 'Send reminders, approvals, and next steps without relying on manual follow-ups.',
        },
      ],
    },
    {
      id: 'build',
      emoji: '🛠️',
      label: 'Build',
      title: 'Teams are building',
      description:
        'Participants move from ideas to execution with mentoring, progress tracking, and submission readiness visible to the organizing team.',
      features: [
        {
          icon: faCode,
          title: 'Project submission workflow',
          desc: 'Collect repos, demos, decks, and updates in one structured submission experience.',
        },
        {
          icon: faHeadset,
          title: 'Mentor coordination',
          desc: 'Keep support touchpoints visible so teams can get help and stay moving through the build phase.',
        },
        {
          icon: faChartLine,
          title: 'Progress visibility',
          desc: 'See which teams are active, blocked, or ready for evaluation before final submissions close.',
        },
      ],
    },
    {
      id: 'judge',
      emoji: '⚖️',
      label: 'Judge',
      title: 'Judging begins',
      description:
        'Scorecards, evaluation rounds, and rankings stay standardized so every project gets a fair and organized review.',
      features: [
        {
          icon: faClipboardList,
          title: 'Flexible scorecards',
          desc: 'Set up criteria, weightage, and judging rounds tailored to your hackathon format.',
        },
        {
          icon: faUsers,
          title: 'Reviewer collaboration',
          desc: 'Coordinate multiple mentors and judges while keeping the final review process aligned.',
        },
        {
          icon: faTrophy,
          title: 'Leaderboard confidence',
          desc: 'Turn every scored review into a transparent ranking for your internal team and finalists.',
        },
      ],
    },
    {
      id: 'win',
      emoji: '🏆',
      label: 'Win',
      title: 'Winners announced',
      description:
        'Close the loop with polished winner visibility, sponsor-ready reporting, and outcomes that extend well beyond demo day.',
      features: [
        {
          icon: faTrophy,
          title: 'Winner showcase',
          desc: 'Highlight top teams and projects with a finale that feels polished for participants and partners alike.',
        },
        {
          icon: faChartBar,
          title: 'Outcome reporting',
          desc: 'Summarize registrations, submissions, and judging results for your internal stakeholders.',
        },
        {
          icon: faDollarSign,
          title: 'Sponsor-ready insights',
          desc: 'Share engagement and campaign impact with sponsors after the hackathon wraps up.',
        },
      ],
    },
  ];
  readonly timelineChecklistItems: TimelineChecklistItem[] = [
    { label: 'Branding and public page ready', complete: true },
    { label: 'Tracks and prizes configured', complete: true },
    { label: 'Judges and mentors invited', complete: true },
    { label: 'Submission workflow finalized', complete: false },
    { label: 'Winner announcement plan locked', complete: false },
  ];
  readonly timelineParticipants: TimelineParticipantCard[] = [
    { initials: 'AR', name: 'Ananya Rao', skill: 'Frontend' },
    { initials: 'DK', name: 'Dev Khanna', skill: 'Backend' },
    { initials: 'NM', name: 'Nina Mehta', skill: 'AI / ML' },
    { initials: 'VS', name: 'Vihaan Shah', skill: 'Mobile' },
    { initials: 'PS', name: 'Priya Sen', skill: 'DevOps' },
    { initials: 'RJ', name: 'Rohan Jain', skill: 'Design' },
  ];
  readonly timelineBuildProjects: TimelineBuildProject[] = [
    {
      name: 'Neural Canvas',
      category: 'AI / ML',
      progressLabel: '96% submission ready',
      progressClass: 'tl-build-row__bar-fill--96',
    },
    {
      name: 'BuildBridge',
      category: 'Developer Tools',
      progressLabel: '84% submission ready',
      progressClass: 'tl-build-row__bar-fill--84',
    },
    {
      name: 'GreenGrid',
      category: 'Climate',
      progressLabel: '72% submission ready',
      progressClass: 'tl-build-row__bar-fill--72',
    },
    {
      name: 'CodeSprint OS',
      category: 'Open Source',
      progressLabel: '60% submission ready',
      progressClass: 'tl-build-row__bar-fill--60',
    },
  ];
  readonly timelineJudgeCriteria = ['Innovation', 'Execution', 'Impact', 'Presentation'];
  readonly timelineJudgeProjects: TimelineJudgeProject[] = [
    {
      name: 'Neural Canvas',
      scores: [
        { value: '9.4', tone: 'strong' },
        { value: '9.1', tone: 'strong' },
        { value: '8.8', tone: 'medium' },
        { value: '9.6', tone: 'strong' },
      ],
    },
    {
      name: 'GreenGrid',
      scores: [
        { value: '8.7', tone: 'medium' },
        { value: '8.5', tone: 'medium' },
        { value: '9.2', tone: 'strong' },
        { value: '8.4', tone: 'medium' },
      ],
    },
    {
      name: 'BuildBridge',
      scores: [
        { value: '8.2', tone: 'light' },
        { value: '8.8', tone: 'medium' },
        { value: '8.1', tone: 'light' },
        { value: '8.9', tone: 'medium' },
      ],
    },
  ];
  readonly timelineWinnerSummary = {
    category: 'AI / ML Track',
    title: 'Neural Canvas',
    subtitle: 'Grand prize winner',
    prize: '₹5,00,000',
  };
  readonly globeLocations: GlobeLocation[] = [
    { lat: 37.7749, lng: -122.4194, label: 'San Francisco' },
    { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
    { lat: 52.52, lng: 13.405, label: 'Berlin' },
    { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
    { lat: 51.5072, lng: -0.1276, label: 'London' },
    { lat: 40.7128, lng: -74.006, label: 'New York' },
  ];
  readonly globeConnections: [number, number][] = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 4],
    [4, 5],
    [5, 0],
  ];
  readonly heroProjectCards: GlobeProjectCard[] = [
    {
      title: 'Neural Canvas',
      category: 'AI / ML',
      hotspotIndex: 1,
      scaleOffset: 0.12,
    },
    {
      title: 'BuildBridge',
      category: 'DevTools',
      hotspotIndex: 4,
      scaleOffset: 0.08,
    },
    {
      title: 'GreenGrid',
      category: 'Climate',
      hotspotIndex: 2,
      scaleOffset: 0.14,
    },
    {
      title: 'CodeSprint OS',
      category: 'Open Source',
      hotspotIndex: 5,
      scaleOffset: 0.1,
    },
  ];

  heroStatDisplays = ['0', '0', '0'];
  statsBandDisplays = ['0', '0', '0'];
  hackathonImages = staticAssets.hackathon_platform;

  // FAQ data
  faqs: IFaq[] = [];

  constructor(
    private seoService: SeoService,
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private domRenderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.setPageMeta();
    this.footerService.changeFooterStatus(true);
    this.setFaq();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.setupHeroAnimations();
    this.initHeroGlobe();
    this.startProjectCardCycle();
    this.setupSectionReveal(this.statsSection?.nativeElement, this.statsContent?.nativeElement, () => {
      if (!this.statsBandCountersStarted) {
        this.statsBandCountersStarted = true;
        this.startStatsBandCounters();
      }
    });
    this.setupSectionReveal(this.featuresSection?.nativeElement, this.featuresContent?.nativeElement);
    this.setupSectionReveal(this.timelineSection?.nativeElement, this.timelineContent?.nativeElement);
    this.startTimelineAutoAdvance();
  }

  get activeTimelineStage(): TimelineStage {
    return this.timelineStages[this.activeTimelineStageIndex];
  }

  get timelineProgressClass(): string {
    return `tl-progress--stage-${this.activeTimelineStageIndex}`;
  }

  trackByIndex(index: number): number {
    return index;
  }

  setTimelineStage(index: number, stopAutoAdvance = false): void {
    if (stopAutoAdvance) {
      this.stopTimelineAutoAdvance();
    }

    this.activeTimelineStageIndex = Math.min(Math.max(index, 0), this.timelineStages.length - 1);
    this.cdr.markForCheck();
  }

  private setFaq(): void {
    this.faqs = [
      {
        question: 'What is included in the Commudle Hackathon Management Platform?',
        answer:
          'Our platform includes end-to-end tools right from registration forms, team shortlisting, mentor & judge onboarding, online assessment, team dashboard, mentor dashboard, project submission, project display, posting project updates, sponsor management, team profiles and most importantly email communications to everyone.',
      },
      {
        question: 'How can I host my first hackathon?',
        answer:
          'If are already on a subscription plan then you will find the Hackathon management dashboard inside your community dashboard.',
      },
      {
        question: 'How much does it cost to host a hackathon on Commudle?',
        answer:
          'The hackathons come bundled within the community suite. You can begin easily by subscribing to one of our plans and unlock all unlimited features.',
      },
      {
        question: 'Can I customize the hackathon landing pages for my brand?',
        answer:
          'Yes! You can add custom branding like a banner image, custom description, tailored registration forms, list prizes, tracks, problem statements etc. on the page as per your liking. The core page structure remains the same because it helps in a higher visibility on search engines and is easy for the users to grasp.',
      },
      {
        question: 'How does the mentoring & judging system work?',
        answer:
          'The mentoring and judging system has options to customize the evaluation criteria for each round. Multiple mentors and teams can interact with each other during these evaluations. The marks allocated to the teams then translate into a leaderboard on the admin dashboard.',
      },
      {
        question: 'What are Commudle Managed Hackathons?',
        answer:
          'If you are looking to organize a standalone public hackathon for your business then we work closely with your team to manage the hackathon end-to-end for you, right from creating the problem statements to project submissions, evaluations and finding winners.',
      },
      {
        question: 'Can participants form teams on the platform?',
        answer: 'The team leader can manage their teams by adding or removing teammates as per their discretion.',
      },
      {
        question: 'How are analytics on your platform more insightful?',
        answer:
          'Apart from the basic geographical and demographical analytics like location, experience, gender, etc. each participant maintains a profile on Commudle which is not just limited to hackathon participation. The analytics displayed by Commudle are far more accurate and they add on to the community building aspect for your brand because they sign up for a hackathon but remain a member for a longer time. You can keep engaging with them along.',
      },
    ];
  }

  private setPageMeta(): void {
    this.seoService.setTags(
      'Hackathon Management Platform - Host, Sponsor & Participate | Commudle',
      'Complete hackathon management platform for hosts, sponsors, and participants. Create, manage, and promote hackathons with ease. Join 500K+ developers.',
      'https://commudle.com/assets/images/commudle-logo-192.png',
    );

    this.setStructuredData();
  }

  private setStructuredData(): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Commudle Hackathon Management Platform',
      description: 'Comprehensive platform for creating, managing, and participating in hackathons',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      provider: {
        '@type': 'Organization',
        name: 'Commudle',
        url: 'https://www.commudle.com',
      },
    };

    this.seoService.setSchema(structuredData);
  }

  private setupHeroAnimations(): void {
    const heroSectionElement = this.heroSection?.nativeElement;

    if (!heroSectionElement) {
      return;
    }

    const cleanup = inView(
      heroSectionElement,
      () => {
        const animatedElements = [this.heroContent?.nativeElement, this.heroVisual?.nativeElement].filter(
          (element): element is HTMLElement => Boolean(element),
        );

        animatedElements.forEach((element, index) => {
          element.animate(
            [
              {
                opacity: 0,
                transform: 'translateY(24px)',
              },
              {
                opacity: 1,
                transform: 'translateY(0px)',
              },
            ],
            {
              delay: index * 120,
              duration: 600,
              easing: 'ease-out',
              fill: 'forwards',
            },
          );
        });

        if (!this.heroCountersStarted) {
          this.heroCountersStarted = true;
          this.startHeroCounters();
        }
      },
      {
        amount: 0.35,
      },
    );

    this.cleanupFns.push(cleanup);
  }

  private startHeroCounters(): void {
    this.counterAnimations.forEach((animationControl) => animationControl.stop());
    this.counterAnimations = [];

    this.heroStats.forEach((stat, index) => {
      const animationControl = animate(0 as number, stat.target, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (value) => {
          this.heroStatDisplays[index] = this.formatHeroStat(Math.round(value), stat.format);
          this.cdr.markForCheck();
        },
      });

      this.counterAnimations.push(animationControl);
    });
  }

  private startStatsBandCounters(): void {
    this.statsBandStats.forEach((stat, index) => {
      const animationControl = animate(0 as number, stat.target, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (value) => {
          this.statsBandDisplays[index] = this.formatHeroStat(Math.round(value), stat.format);
          this.cdr.markForCheck();
        },
      });

      this.counterAnimations.push(animationControl);
    });
  }

  private setupSectionReveal(sectionElement?: HTMLElement, contentElement?: HTMLElement, onEnter?: () => void): void {
    if (!sectionElement || !contentElement) {
      return;
    }

    let hasAnimated = false;
    this.domRenderer.setStyle(contentElement, 'opacity', '0');
    this.domRenderer.setStyle(contentElement, 'transform', 'translateY(24px)');

    const cleanup = inView(sectionElement, () => {
      if (hasAnimated) {
        return;
      }

      hasAnimated = true;
      contentElement.animate(
        [
          {
            opacity: 0,
            transform: 'translateY(24px)',
          },
          {
            opacity: 1,
            transform: 'translateY(0px)',
          },
        ],
        {
          duration: 600,
          easing: 'ease-out',
          fill: 'forwards',
        },
      );

      onEnter?.();
    });

    this.cleanupFns.push(cleanup);
  }

  private startTimelineAutoAdvance(): void {
    if (!this.isBrowser || this.timelineAutoAdvanceTimer) {
      return;
    }

    this.timelineAutoAdvanceTimer = window.setInterval(() => {
      const nextIndex = (this.activeTimelineStageIndex + 1) % this.timelineStages.length;
      this.setTimelineStage(nextIndex);
    }, 3500);
  }

  private stopTimelineAutoAdvance(): void {
    if (!this.timelineAutoAdvanceTimer) {
      return;
    }

    window.clearInterval(this.timelineAutoAdvanceTimer);
    this.timelineAutoAdvanceTimer = undefined;
  }

  private initHeroGlobe(): void {
    if (!this.globeCanvas?.nativeElement) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const canvasElement = this.globeCanvas?.nativeElement;

      if (!canvasElement) {
        return;
      }

      const globeRenderer = new Renderer({
        alpha: true,
        antialias: true,
        canvas: canvasElement,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const { gl } = globeRenderer;
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl, {
        aspect: 1,
        far: 100,
        fov: 36,
        near: 0.1,
      });
      camera.position.set(0, 0, 4.2);
      camera.lookAt([0, 0, 0]);

      const scene = new Transform();
      const globeGroup = new Transform();
      globeGroup.setParent(scene);
      globeGroup.rotation.x = this.globeRotationX;
      globeGroup.rotation.y = this.globeRotationY;

      const globeGeometry = new Geometry(gl, {
        position: {
          data: this.createDotMatrixPositions(180, 1.18),
          size: 3,
        },
      });

      const globeProgram = new Program(gl, {
        cullFace: false,
        depthWrite: false,
        fragment: HERO_GLOBE_FRAGMENT,
        transparent: true,
        uniforms: {
          uColor: { value: new Color('#3366ff') },
          uPointSize: { value: 6.5 },
        },
        vertex: HERO_GLOBE_VERTEX,
      });

      const globeMesh = new Mesh(gl, {
        geometry: globeGeometry,
        mode: gl.POINTS,
        program: globeProgram,
      });
      globeMesh.frustumCulled = false;
      globeMesh.setParent(globeGroup);

      const lines = this.globeConnections.map(([startIndex, endIndex]) => {
        const line = new Polyline(gl, {
          fragment: HERO_ARC_FRAGMENT,
          points: this.createArcPoints(this.globeLocations[startIndex], this.globeLocations[endIndex], 1.18, 0.26),
          uniforms: {
            uColor: { value: new Color('#3366ff') },
            uOpacity: { value: 0.3 },
            uThickness: { value: 1.4 },
          },
        });

        line.mesh.frustumCulled = false;
        line.mesh.setParent(globeGroup);

        return line;
      });

      this.globeState = {
        camera,
        globeGroup,
        hotspotPoints: this.globeLocations.map((location) => this.latLngToVec3(location.lat, location.lng, 1.24)),
        lines,
        renderer: globeRenderer,
        scene,
      };

      this.updateGlobeSize();

      this.cleanupFns.push(
        this.domRenderer.listen(canvasElement, 'mousedown', (event: MouseEvent) => {
          this.onGlobeDragStart(event.clientX, event.clientY);
        }),
        this.domRenderer.listen('window', 'mousemove', (event: MouseEvent) => {
          this.onGlobeDragMove(event.clientX, event.clientY);
        }),
        this.domRenderer.listen('window', 'mouseup', () => {
          this.onGlobeDragEnd();
        }),
        this.domRenderer.listen('window', 'mouseleave', () => {
          this.onGlobeDragEnd();
        }),
        this.domRenderer.listen(canvasElement, 'touchstart', (event: TouchEvent) => {
          if (!event.touches.length) {
            return;
          }

          this.onGlobeDragStart(event.touches[0].clientX, event.touches[0].clientY);
        }),
        this.domRenderer.listen('window', 'touchmove', (event: TouchEvent) => {
          if (!event.touches.length) {
            return;
          }

          this.onGlobeDragMove(event.touches[0].clientX, event.touches[0].clientY);
        }),
        this.domRenderer.listen('window', 'touchend', () => {
          this.onGlobeDragEnd();
        }),
        this.domRenderer.listen('window', 'resize', () => {
          this.updateGlobeSize();
        }),
      );

      const renderFrame = () => {
        if (!this.globeState) {
          return;
        }

        if (!this.isGlobeDragging) {
          this.globeRotationY += 0.004 + this.globeVelocityX;
          this.globeRotationX = this.clamp(this.globeRotationX + this.globeVelocityY, -0.55, 0.55);
          this.globeVelocityX *= 0.95;
          this.globeVelocityY *= 0.95;
        }

        this.globeState.globeGroup.rotation.x = this.globeRotationX;
        this.globeState.globeGroup.rotation.y = this.globeRotationY;

        this.globeState.renderer.render({
          camera: this.globeState.camera,
          scene: this.globeState.scene,
        });

        this.updateGlobeOverlays();
        this.animationFrameId = window.requestAnimationFrame(renderFrame);
      };

      renderFrame();
    });
  }

  private updateGlobeSize(): void {
    if (!this.globeState || !this.globeWrap?.nativeElement) {
      return;
    }

    const width = Math.max(this.globeWrap.nativeElement.clientWidth, 1);
    const height = Math.max(this.globeWrap.nativeElement.clientHeight || width, 1);

    this.globeState.renderer.setSize(width, height);
    this.globeState.camera.perspective({
      aspect: width / height,
    });
    this.globeState.lines.forEach((line) => line.resize());
    this.updateGlobeOverlays();
  }

  private updateGlobeOverlays(): void {
    if (!this.globeState || !this.globeWrap?.nativeElement) {
      return;
    }

    const wrapWidth = this.globeWrap.nativeElement.clientWidth;
    const wrapHeight = this.globeWrap.nativeElement.clientHeight;
    const hotspotElements = this.hotspotElements?.toArray() || [];
    const projectCardElements = this.projectCardElements?.toArray() || [];

    this.globeState.camera.updateMatrixWorld();
    this.globeState.globeGroup.updateMatrixWorld(true);

    this.globeState.hotspotPoints.forEach((hotspotPoint, index) => {
      const hotspotElement = hotspotElements[index]?.nativeElement;

      if (!hotspotElement) {
        return;
      }

      const projection = this.projectToGlobeViewport(hotspotPoint, wrapWidth, wrapHeight);

      this.domRenderer.setStyle(hotspotElement, 'left', `${projection.x}px`);
      this.domRenderer.setStyle(hotspotElement, 'top', `${projection.y}px`);
      this.domRenderer.setStyle(hotspotElement, 'opacity', projection.visible ? '1' : '0');
    });

    this.heroProjectCards.forEach((projectCard, index) => {
      const projectCardElement = projectCardElements[index]?.nativeElement;

      if (!projectCardElement) {
        return;
      }

      const anchorPoint = this.globeState?.hotspotPoints[projectCard.hotspotIndex]
        ?.clone()
        .normalize()
        .scale(1.54 + projectCard.scaleOffset);

      if (!anchorPoint) {
        return;
      }

      const projection = this.projectToGlobeViewport(anchorPoint, wrapWidth, wrapHeight);
      const opacity = projection.visible ? (index === this.activeProjectCardIndex ? 1 : 0.28) : 0;
      const scale = index === this.activeProjectCardIndex ? 1 : 0.94;

      this.domRenderer.setStyle(projectCardElement, 'left', `${projection.x}px`);
      this.domRenderer.setStyle(projectCardElement, 'top', `${projection.y}px`);
      this.domRenderer.setStyle(projectCardElement, 'opacity', `${opacity}`);
      this.domRenderer.setStyle(projectCardElement, 'transform', `translate(-50%, -50%) scale(${scale})`);
    });
  }

  private projectToGlobeViewport(
    point: Vec3,
    wrapWidth: number,
    wrapHeight: number,
  ): { x: number; y: number; visible: boolean } {
    if (!this.globeState) {
      return { x: 0, y: 0, visible: false };
    }

    const worldPoint = point.clone().applyMatrix4(this.globeState.globeGroup.worldMatrix);
    const surfaceNormal = worldPoint.clone().normalize();
    const toCamera = this.globeState.camera.worldPosition.clone().sub(worldPoint).normalize();
    const facingCamera = surfaceNormal.dot(toCamera) > 0.08;
    const screenPoint = worldPoint.clone();

    this.globeState.camera.project(screenPoint);

    return {
      visible: facingCamera,
      x: (screenPoint.x + 1) * 0.5 * wrapWidth,
      y: (1 - screenPoint.y) * 0.5 * wrapHeight,
    };
  }

  private startProjectCardCycle(): void {
    if (!this.isBrowser) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.projectCardTimer = window.setInterval(() => {
        this.activeProjectCardIndex = (this.activeProjectCardIndex + 1) % this.heroProjectCards.length;
      }, 2500);
    });
  }

  private onGlobeDragStart(pointerX: number, pointerY: number): void {
    this.isGlobeDragging = true;
    this.lastPointerX = pointerX;
    this.lastPointerY = pointerY;
  }

  private onGlobeDragMove(pointerX: number, pointerY: number): void {
    if (!this.isGlobeDragging || !this.globeWrap?.nativeElement) {
      return;
    }

    const wrapWidth = Math.max(this.globeWrap.nativeElement.clientWidth, 1);
    const wrapHeight = Math.max(this.globeWrap.nativeElement.clientHeight, 1);
    const deltaX = (pointerX - this.lastPointerX) / wrapWidth;
    const deltaY = (pointerY - this.lastPointerY) / wrapHeight;

    this.globeRotationY += deltaX * 3.6;
    this.globeRotationX = this.clamp(this.globeRotationX + deltaY * 2.4, -0.55, 0.55);
    this.globeVelocityX = deltaX * 0.12;
    this.globeVelocityY = deltaY * 0.08;
    this.lastPointerX = pointerX;
    this.lastPointerY = pointerY;
  }

  private onGlobeDragEnd(): void {
    this.isGlobeDragging = false;
  }

  private createDotMatrixPositions(pointCount: number, radius: number): Float32Array {
    const positions = new Float32Array(pointCount * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < pointCount; index++) {
      const t = pointCount === 1 ? 0 : index / (pointCount - 1);
      const y = 1 - t * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * index;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      positions[index * 3] = x * radius;
      positions[index * 3 + 1] = y * radius;
      positions[index * 3 + 2] = z * radius;
    }

    return positions;
  }

  private latLngToVec3(lat: number, lng: number, radius: number): Vec3 {
    const latitude = (lat * Math.PI) / 180;
    const longitude = (lng * Math.PI) / 180;
    const cosLat = Math.cos(latitude);

    return new Vec3(
      radius * cosLat * Math.sin(longitude),
      radius * Math.sin(latitude),
      radius * cosLat * Math.cos(longitude),
    );
  }

  private createArcPoints(start: GlobeLocation, end: GlobeLocation, radius: number, lift: number): Vec3[] {
    const startPoint = this.latLngToVec3(start.lat, start.lng, radius).normalize();
    const endPoint = this.latLngToVec3(end.lat, end.lng, radius).normalize();
    const dot = this.clamp(startPoint.dot(endPoint), -1, 1);
    const angle = Math.acos(dot);
    const sinAngle = Math.sin(angle) || 1;
    const segmentCount = 48;
    const points: Vec3[] = [];

    for (let index = 0; index <= segmentCount; index++) {
      const progress = index / segmentCount;
      const startWeight = Math.sin((1 - progress) * angle) / sinAngle;
      const endWeight = Math.sin(progress * angle) / sinAngle;
      const interpolatedPoint = startPoint
        .clone()
        .scale(startWeight)
        .add(endPoint.clone().scale(endWeight))
        .normalize()
        .scale(radius + Math.sin(Math.PI * progress) * lift);

      points.push(interpolatedPoint);
    }

    return points;
  }

  private formatHeroStat(value: number, format: HeroStatConfig['format']): string {
    if (format === 'percentage') {
      return `${value}%`;
    }

    if (value >= 1000) {
      return `${Math.round(value / 1000)}K+`;
    }

    return `${value}`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.counterAnimations.forEach((animationControl) => animationControl.stop());
    this.cleanupFns.forEach((cleanupFn) => cleanupFn());

    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
    }

    if (this.projectCardTimer) {
      window.clearInterval(this.projectCardTimer);
    }

    this.stopTimelineAutoAdvance();
  }
}
