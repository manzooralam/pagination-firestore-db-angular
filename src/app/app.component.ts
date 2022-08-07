import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  // tableData will contains the document items get from collection
  tableData: any[] = [];
  // save first document in snapshot of items received
  firstInResponse: any = [];
  // save last document in snapshot of items received
  lastInResponse: any = [];
  // keep te array of first document of previous pages
  prev_strt_at: any = [];
  // maintain the count of clicks on Next Prev button
  pagination_clicked_count = 0;
  // two buttons will be needed by which next data or prev data will be loaded
  // disable next and prev buttons
  disable_next: boolean = false;
  disable_prev: boolean = true;
  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.getItems();
  }

  async getItems() {
    const schoolCollRef = this.afs.collection('School', ref => ref
      //.where('Pincode', '==', '560021')
      .where('Board', '==', 'Central Board of Secondary Education - CBSE')
      .orderBy('Name', 'asc')
      .limit(2)
    ).get();
    const schDocs = (await firstValueFrom(await schoolCollRef))?.docs;
    if (!schDocs?.length) {
      console.log('No Data Available');
      return false;
    }
    this.firstInResponse = schDocs[0];
    this.lastInResponse = schDocs[schDocs.length - 1];

    this.tableData = [];
    for (const item of schDocs) {
      this.tableData.push(item.data());
    }
    // initialize values
    this.prev_strt_at = [];
    this.pagination_clicked_count = 0;
    this.disable_next = false;
    this.disable_prev = false;

    // push first item to use for Previous action
    this.push_prev_startAt(this.firstInResponse);
    return true
  }
  // add a document
  push_prev_startAt(prev_first_doc) {
    this.prev_strt_at.push(prev_first_doc);
  }
  // remove non required document
  pop_prev_startAt(prev_first_doc) {
    this.prev_strt_at.forEach((element) => {
      if (prev_first_doc.data().id === element.data().id) {
        element = null;
      }
    });
  }
  // return the Doc rem where previous page will startAt
  get_prev_startAt() {
    if (this.prev_strt_at.length > (this.pagination_clicked_count + 1)) {
      this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
    }
    return this.prev_strt_at[this.pagination_clicked_count - 1];
  }

  async nextPage() {
    this.disable_next = true;
    const schoolCollRef = this.afs.collection('School', ref => ref
      //.where('Pincode', '==', '560021')
      .where('Board', '==', 'Central Board of Secondary Education - CBSE')
      .orderBy('Name', 'asc')
      .startAfter(this.lastInResponse)
      .limit(2)
    ).get();
    const schDocs = (await firstValueFrom(await schoolCollRef))?.docs;
    if (!schDocs.length) {
      console.log('No More Data Available');
      this.disable_next = true;
      return;
    }
    this.firstInResponse = schDocs[0];
    this.lastInResponse = schDocs[schDocs.length - 1];
    this.tableData = [];
    for (const item of schDocs) {
      this.tableData.push(item.data());
    }
    this.pagination_clicked_count++;
    this.push_prev_startAt(this.firstInResponse);
    if (schDocs.length < 2) {
      // disable next button if data fetched is less than 5 - means no more data left to load
      // because limit ti get data is set to 5
      this.disable_next = true;
    } else {
      this.disable_next = false;
    }
    this.disable_prev = false;
    return
  }

  async prevPage() {
    this.disable_prev = true;
    const schoolCollRef = this.afs.collection('School', ref => ref
      //.where('Pincode', '==', '560021')
      .where('Board', '==', 'Central Board of Secondary Education - CBSE')
      .orderBy('Name', 'asc')
      .startAt(this.get_prev_startAt())
      .endBefore(this.firstInResponse)
      .limit(2)
    ).get();
    const schDocs = (await firstValueFrom(await schoolCollRef))?.docs;
    // .subscribe((response: any) => {
    this.firstInResponse = schDocs[0];
    this.lastInResponse = schDocs[schDocs.length - 1];

    this.tableData = [];
    for (const item of schDocs) {
      this.tableData.push(item.data());
    }

    // maintaing page no.
    this.pagination_clicked_count--;

    // pop not required value in array
    this.pop_prev_startAt(this.firstInResponse);

    // enable buttons again
    if (this.pagination_clicked_count == 0) {
      this.disable_prev = true;
    } else {
      this.disable_prev = false;
    }
    this.disable_next = false;
    // }, (error: any) => {
    //     this.disable_prev = false;
    // });
  }
}
