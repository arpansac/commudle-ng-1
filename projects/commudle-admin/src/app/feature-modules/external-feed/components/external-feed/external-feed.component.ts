import { Component, OnInit } from '@angular/core';
import { FeedItemService } from 'projects/commudle-admin/src/app/services/feed-items.service';
import { Title, Meta } from '@angular/platform-browser';
import { IFeedItem } from 'projects/shared-models/feed-item.model';

@Component({
  selector: 'app-external-feed',
  templateUrl: './external-feed.component.html',
  styleUrls: ['./external-feed.component.scss']
})
export class ExternalFeedComponent implements OnInit {
  externalPosts: IFeedItem[] = [];
  total;
  isLoading = false;
  canLoadMore = true;

  constructor(
    private feedItemService: FeedItemService,
    private title: Title,
    private meta: Meta
  ) {
  }

  ngOnInit() {
    this.getFeedPosts();
    this.setMeta();
  }

  getFeedPosts(): void{
    this.feedItemService.pGetAll().subscribe(value=> {
      this.externalPosts = value.feed_items;
    });
  }

  setMeta(): void{
    this.title.setTitle('Feed from Around the World');

    this.meta.updateTag({ name: 'description', content: `Find what more is happening around the world of tech`});


    this.meta.updateTag({ name: 'og:image', content: 'https://commudle.com/assets/images/commudle-logo192.png' });
    this.meta.updateTag({ name: 'og:image:secure_url', content: 'https://commudle.com/assets/images/commudle-logo192.png' });
    this.meta.updateTag({ name: 'og:title', content: `Feed from Around the World` });
    this.meta.updateTag({ name: 'og:description', content: `Find what more is happening around the world of tech`});
    this.meta.updateTag( { name: 'og:type', content: 'website'});

    this.meta.updateTag({ name: 'twitter:image', content: 'https://commudle.com/assets/images/commudle-logo192.png' });
    this.meta.updateTag({ name: 'twitter:title', content: `Feed from Around the World` });
    this.meta.updateTag({ name: 'twitter:description', content: `Find what more is happening around the world of tech`});
  }

}