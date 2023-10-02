# vulcan-scraper
Small library to scrape Vulcan e-register

## Example
```js
import { VulcanHandler } from "vulcan-scraper";

const vulcanHandler = new VulcanHandler("student@school.com", "P@ssw0rd", "city");

await vulcanHandler.login();

console.log(await vulcanHandler.getStudentGrades());

await vulcanHandler.logout();
```
Output:
```js
{
  'Język polski': { average: 2, grades: [ [Object] ] },
  'Język angielski': { average: 0, grades: [] },
  'Tworzenie stron i aplikacji internetowych': { average: 5.5, grades: [ [Object] ] },
  'Systemy baz danych': { average: 0, grades: [] },
  'Projektowanie baz danych': { average: 4.5, grades: [ [Object], [Object] ] }
}
```