import { UwplannerPage } from './app.po';

describe('uwplanner App', () => {
  let page: UwplannerPage;

  beforeEach(() => {
    page = new UwplannerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
