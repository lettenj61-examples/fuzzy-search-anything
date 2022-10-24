import Fuse from "fuse.js";
import { debounce } from "rambdax";
import { html } from "htm/preact";
import { useEffect, useRef, useState } from "preact/hooks";

const enum Page {
  SourceText = "source-text",
  FuzzyFinder = "fuzzy-finder",
}

export function App() {
  const [page, setPage] = useState<Page>(Page.SourceText);
  const [list, setList] = useState<string[]>([]);

  const toSearchView = () => {
    setPage(Page.FuzzyFinder);
  };

  const toInputView = () => setPage(Page.SourceText);

  const acceptNewSource = (newSource: string) => setList(newSource.split("\n"));

  if (page === Page.SourceText) {
    return html`<div><${SourceText} onClickSearch=${toSearchView} onNewSource=${acceptNewSource} /></div>`;
  } else {
    return html`<div><${FuzzyFinder} list=${list} onClickBack=${toInputView} /></div>`;
  }
}

type SourceTextProps = {
  onClickSearch: () => void;
  onNewSource: (newSource: string) => void;
};

function SourceText({ onClickSearch, onNewSource }: SourceTextProps) {
  const [source, setSource] = useState("");
  const searchDisabled = source === "";

  const onInput = (e: Event): void => {
    const target = e.currentTarget as HTMLTextAreaElement;
    setSource(target.value);
  };

  const notify = (): void => {
    if (!searchDisabled) {
      onClickSearch();
      onNewSource(source);
    }
  };

  return html`
<section>
  <label for="source">
    <strong>Source</strong>
  </label>
  <textarea
    onInput=${onInput}
    value=${source}
    class="source"
    name="source"
    id="source"></textareaclass=>
  <div>
    <button
      disabled=${searchDisabled}
      onClick=${notify}
      >Search</button>
  </div>
</section>
  `;
}

type FuzzyFinderProps = {
  list: string[];
  onClickBack: () => void;
};

function FuzzyFinder({ list, onClickBack }: FuzzyFinderProps) {
  const fz = useRef(
    new Fuse<string>(list, {
      includeScore: true,
      shouldSort: true,
      minMatchCharLength: 3,
    }),
  );

  const [pattern, setPattern] = useState("");
  const [output, setOutput] = useState<Fuse.FuseResult<string>[]>([]);
  const onInput = (e: Event): void =>
    setPattern((e.currentTarget as HTMLInputElement).value);

  const performSearch = debounce(() => {
    if (pattern && pattern.length > 0) {
      const res = fz.current.search(pattern);
      setOutput(res.slice(0, 10));
    } else {
      setOutput([]);
    }
  }, 250);

  useEffect(() => performSearch(null), [pattern]);

  return html`
<section>
  <div>
    <p>
      <strong>Matches: </strong>
      <span>${output.length}</span>
    </p>
    <ul class="output">
      ${
    output.map((match) => (
      html`<li title=${match.score}>
          <span class="match">${match.item}</span>
        </li>`
    ))
  }
    </ul>
  </div>
  <div>
    <input onInput=${onInput} value=${pattern} placeholder="Text to search" />
  </div>
  <div>
    <button onClick=${onClickBack}>Back</button>
  </div>
</section>
  `;
}
