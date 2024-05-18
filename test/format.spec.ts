import { describe, it, expect } from "vitest";
import { stripIndent } from "common-tags";

import { FormatArgs, format } from "../src/format";

describe("format", () => {
  describe("embedded languages", () => {
    const filepath = "note.md";
    const cursorOffset = 1;
    const prettierOptions = {};

    const getArgs = (text: string): FormatArgs => ({
      filepath,
      cursorOffset,
      prettierOptions,
      text,
    });

    const testFormat = (text: string) => format(getArgs(text));

    it("should format js", async () => {
      await expect(
        testFormat(
          stripIndent`
        # JS note

        ${"```javascript"}
          const foo = 'bar'



          const array = [1,    2,
            3];
        ${"```"}
        `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format jsx", async () => {
      await expect(
        testFormat(
          stripIndent`
        # JSX note

        ${"```jsx"}
          function MyButton() {
            return (
          <button>I'm a button


              </button>
            );
          }
        ${"```"}
        `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format ts", async () => {
      await expect(
        testFormat(
          stripIndent`
        # TS note

        ${"```typescript"}
          const foo:   string = 'bar'



          const array: Array<
          number > = [1,    2,
            3];
        ${"```"}
        `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format tsx", async () => {
      await expect(
        testFormat(
          stripIndent`
        # TSX note

        ${"```tsx"}
          function MyButton({title}:
                            { title: string }) {
            return (
          <button>{
            title
          }</button>
            );
          }
        ${"```"}
        `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format angular", async () => {
      await expect(
        testFormat(
          stripIndent`
        # Angular note

        ${"```typescript"}
          import {Component} from '@angular/core';
          
          @Component({
            selector: 'app-root',
            standalone: true,
            imports: [],
            template: \`
              <h1>



              {{


                title
              }}


              </h1>
            \`,
            styleUrls: ['./app.component.css'],
          })
          export class AppComponent {
            title = 'default';
          }
        ${"```"}
        `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format json", async () => {
      await expect(
        testFormat(
          stripIndent`
        # JSON note

        ${"```json"}
        {"foo": "bar", 
          "bar": true,

              "baz": 1
        }

        ${"```"}

          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format jsonc", async () => {
      await expect(
        testFormat(
          stripIndent`
        # JSON note

        ${"```jsonc"}
        {"foo": "bar", 
          // a comment
          "bar": true,

              "baz": 1
        }

        ${"```"}

          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format flow", async () => {
      await expect(
        testFormat(
          stripIndent`
        # Flow note

        ${"```js"}
          // @flow
          opaque type ID = string;
          
          function identity(x:      ID):ID {return x;
          }
          export type {ID};
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format handlebars", async () => {
      await expect(
        testFormat(
          stripIndent`
        # Handlebars note

        ${"```handlebars"}
          <ul class="people_list">{{#each people}}
                            <li>{{this}}</li>{{/each}}
              </ul>
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format graphql", async () => {
      await expect(
        testFormat(
          stripIndent`
        # GraphQL note

        ${"```graphql"}
          {
            project (

              name: "GraphQL"

            ) {
            tagline
            }
          }
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format html", async () => {
      await expect(
        testFormat(
          stripIndent`
        # HTML note

        ${"```html"}
          <h1>
          The Crushing Bore</h1><p>By Chris Mills</p>
          
          <h2>
                    Chapter 1: The dark night</h2>


          <p>It was a dark night. Somewhere, an owl hooted. The rain lashed down on the…
          </p>
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format css", async () => {
      await expect(
        testFormat(
          stripIndent`
        # CSS note

        ${"```css"}
          h1 {color: red;   font-size: 5em;
          }
          
          p {
          
          
          
            color: black;}
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format scss", async () => {
      await expect(
        testFormat(
          stripIndent`
        # SCSS note

        ${"```scss"}
          @mixin theme($theme:DarkGray  ){
            background: $theme;box-shadow: 0 0 1px rgba($theme, .25);
            color: #fff;
          }
          
          .info {@include theme;
          }
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format less", async () => {
      await expect(
        testFormat(
          stripIndent`
        # LESS note

        ${"```less"}
          #library() { .colors() {primary: green;
              secondary: blue;
            }
          }
          
          .button {
            color: #library.colors[primary ];border-color: #library.colors[secondary];
          }
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });

    it("should format yaml", async () => {
      await expect(
        testFormat(
          stripIndent`
        # YAML note

        ${"```yaml"}
          name: Martin D'vloper #key-value
          
          
          
          age:     26
          hobbies:
            - painting #first list item
            
            
            - playing_music #second list item
            - cooking #third list item
        ${"```"}
          `,
        ),
      ).resolves.toMatchSnapshot();
    });
  });
});
