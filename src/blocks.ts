import type { Editor, BlockProperties } from 'grapesjs';
import { PluginOptions } from '.';

export default function (editor: Editor, opts: Required<PluginOptions>) {
  const bm = editor.BlockManager;
  const { category, blocks, stylePrefix, flexGrid, rowHeight, addBasicStyle } = opts;
  const clsRow = `${stylePrefix}row`;
  const clsCell = `${stylePrefix}cell`;
  const styleRow = flexGrid
    ? `
    .${clsRow} {
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      flex-wrap: nowrap;
      padding: 10px;
    }
    @media (max-width: 768px) {
      .${clsRow} {
        flex-wrap: wrap;
      }
    }`
    : `
    .${clsRow} {
      display: table;
      padding: 10px;
      width: 100%;
    }
    @media (max-width: 768px) {
      .${stylePrefix}cell, .${stylePrefix}cell30, .${stylePrefix}cell70 {
        width: 100%;
        display: block;
      }
    }`;
  const styleClm = flexGrid
    ? `
    .${clsCell} {
      min-height: ${rowHeight}px;
      flex-grow: 1;
      flex-basis: 100%;
    }`
    : `
    .${clsCell} {
      width: 8%;
      display: table-cell;
      height: ${rowHeight}px;
    }`;
  const styleClm30 = `
  .${stylePrefix}cell30 {
    width: 30%;
  }`;
  const styleClm70 = `
  .${stylePrefix}cell70 {
    width: 70%;
  }`;
  const styleSection = `
  [data-gjs-type="container"]:empty {
    text-decoration: none;
    padding: 5px;
  }
  .gjs-container {
      width: 90%;
      margin: 0 auto;
      max-width: 1200px;
  }
  [data-gjs-type="container"]:empty:before {
      background-color: #ddd;
      color: #000;
      font-size: 16px;
      font-weight: bold;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 30px;
      padding: 0 10px;
      opacity: 0.3;
      border-radius: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      content: "Container";
  }
  `;

  const styleHeading = `.gjs-heading {
  margin: 0;
  color: rgba(29, 40, 55, 1);
  }`;

  const styleDivider = `.gjs-divider {
    white-space: nowrap;
    overflow: hidden;
    font-size: .875rem;
    line-height: 1.25rem;
    height:2px;
    background: #e5e7eb;
  }`;

  const step = 0.2;
  const minDim = 1;
  const currentUnit = 1;
  const resizerBtm: Record<string, any> = {
    tl: 0,
    tc: 0,
    tr: 0,
    cl: 0,
    cr: 0,
    bl: 0,
    br: 0,
    minDim
  };
  const resizerRight: Record<string, any> = {
    ...resizerBtm,
    cr: 1,
    bc: 0,
    currentUnit,
    minDim,
    step
  };

  // Flex elements do not react on width style change therefore I use
  // 'flex-basis' as keyWidth for the resizer on columns
  if (flexGrid) {
    resizerRight.keyWidth = 'flex-basis';
  }

  const rowAttr = {
    class: clsRow,
    'data-gjs-droppable': `.${clsCell}`,
    'data-gjs-resizable': resizerBtm,
    'data-gjs-name': 'Row'
  };

  const colAttr: Record<string, any> = {
    class: clsCell,
    'data-gjs-draggable': `.${clsRow}`,
    'data-gjs-resizable': resizerRight,
    'data-gjs-name': 'Cell'
  };

  if (flexGrid) {
    colAttr['data-gjs-unstylable'] = ['width'];
    colAttr['data-gjs-stylable-require'] = ['flex-basis'];
  }

  // Make row and column classes private
  const privateCls = [`.${clsRow}`, `.${clsCell}`];
  editor.on(
    'selector:add',
    selector =>
      privateCls.indexOf(selector.getFullName()) >= 0 &&
      selector.set('private', 1)
  );

  const attrsToString = (attrs: Record<string, any>) => {
    const result = [];

    for (let key in attrs) {
      let value = attrs[key];
      const toParse = value instanceof Array || value instanceof Object;
      value = toParse ? JSON.stringify(value) : value;
      result.push(`${key}=${toParse ? `'${value}'` : `'${value}'`}`);
    }

    return result.length ? ` ${result.join(' ')}` : '';
  };

  const toAdd = (name: string) => blocks.indexOf(name) >= 0;
  const attrsRow = attrsToString(rowAttr);
  const attrsCell = attrsToString(colAttr);
  const commonBlockProps: Partial<BlockProperties> = {
    category,
    select: true,
  };

  toAdd('section') &&
    bm.add('section', {
      ...commonBlockProps,
      label: opts.labelSection,
      media: `<svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M21 18H2V20H21V18M19 10V14H4V10H19M20 8H3C2.45 8 2 8.45 2 9V15C2 15.55 2.45 16 3 16H20C20.55 16 21 15.55 21 15V9C21 8.45 20.55 8 20 8M21 4H2V6H21V4Z"></path>
  </svg>`,
      content: `<div data-gjs-type="container" class="gjs-container"></div>
    ${addBasicStyle
          ? `<style>
        ${styleSection}
      </style>`
          : ''
        }`
    });
  toAdd('column1') &&
    bm.add('column1', {
      ...commonBlockProps,
      label: opts.labelColumn1,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M2 20h20V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h20a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"/>
      </svg>`,
      content: `<div ${attrsRow}>
        <div ${attrsCell}></div>
      </div>
      ${addBasicStyle
          ? `<style>
          ${styleRow}
          ${styleClm}
        </style>`
          : ''
        }`
    });

  toAdd('column2') &&
    bm.add('column2', {
      ...commonBlockProps,
      label: opts.labelColumn2,
      media: `<svg viewBox="0 0 23 24">
        <path fill="currentColor" d="M2 20h8V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM13 20h8V4h-8v16Zm-1 0V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1Z"/>
      </svg>`,
      content: `<div ${attrsRow}>
        <div ${attrsCell}></div>
        <div ${attrsCell}></div>
      </div>
      ${addBasicStyle
          ? `<style>
          ${styleRow}
          ${styleClm}
        </style>`
          : ''
        }`
    });

  toAdd('column3') &&
    bm.add('column3', {
      ...commonBlockProps,
      label: opts.labelColumn3,
      media: `<svg viewBox="0 0 23 24">
        <path fill="currentColor" d="M2 20h4V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM17 20h4V4h-4v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1ZM9.5 20h4V4h-4v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z"/>
      </svg>`,
      content: `<div ${attrsRow}>
        <div ${attrsCell}></div>
        <div ${attrsCell}></div>
        <div ${attrsCell}></div>
      </div>
      ${addBasicStyle
          ? `<style>
          ${styleRow}
          ${styleClm}
        </style>`
          : ''
        }`
    });

  toAdd('column3-7') &&
    bm.add('column3-7', {
      ...commonBlockProps,
      label: opts.labelColumn37,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M2 20h5V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM10 20h12V4H10v16Zm-1 0V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1Z"/>
      </svg>`,
      content: `<div ${attrsRow}>
        <div ${attrsCell} style='${flexGrid ? 'flex-basis' : 'width'
        }: 30%;'></div>
        <div ${attrsCell} style='${flexGrid ? 'flex-basis' : 'width'
        }: 70%;'></div>
      </div>
      ${addBasicStyle
          ? `<style>
          ${styleRow}
          ${styleClm}
          ${styleClm30}
          ${styleClm70}
        </style>`
          : ''
        }`
    });
  toAdd('divider') &&
    bm.add('divider', {
      ...commonBlockProps,
      activate: true,
      label: opts.labelDivider,
      media: `<svg viewBox="0 0 24 24">
      <path d="M8,18H11V15H2V13H22V15H13V18H16L12,22L8,18M12,2L8,6H11V9H2V11H22V9H13V6H16L12,2Z"></path>
    </svg>`,
      content: `<div class="gjs-divider" title="divider"></div><style>${styleDivider}</style>`,
    });
  toAdd('heading') &&
    bm.add('heading', {
      ...commonBlockProps,
      activate: true,
      label: opts.labelHeading,
      media: `<svg viewBox="0 0 24 24">
      <path d="M8.3 11.5h7.4V6.9l-.2-1.6a1 1 0 00-.5-.5c-.3-.2-.7-.3-1-.3h-.6v-.4h6.8v.4h-.6c-.4 0-.7.1-1 .3a1 1 0 00-.6.6L18 6.9v10.3c0 .8 0 1.3.2 1.6 0 .2.2.3.4.5.4.2.7.3 1.1.3h.6v.4h-6.8v-.4h.5c.7 0 1.2-.2 1.5-.6.2-.3.3-.9.3-1.8v-4.9H8.3v4.9l.1 1.6.5.5c.3.2.7.3 1 .3h.7v.4H3.7v-.4h.6c.7 0 1.1-.2 1.4-.6.2-.3.3-.9.3-1.8V6.9L6 5.3a1 1 0 00-.5-.5l-1-.3h-.7v-.4h6.9v.4H10c-.4 0-.8.1-1 .3a1 1 0 00-.6.6l-.1 1.5v4.6z"></path>
    </svg>`,
      content: {
        type: 'text',
        content: `<h1 data-gjs-type="heading" draggable="true" class="gjs-heading" contenteditable="true">Insert your text here</h1><style>${styleHeading}</style>`,
        style: { padding: '10px' },
      }
    });

  toAdd('text') &&
    bm.add('text', {
      ...commonBlockProps,
      activate: true,
      label: opts.labelText,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z" />
      </svg>`,
      content: {
        type: 'text',
        content: 'Insert your text here',
        style: { padding: '10px' },
      }
    });

  toAdd('link') &&
    bm.add('link', {
      ...commonBlockProps,
      label: opts.labelLink,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" />
      </svg>`,
      content: {
        type: 'link',
        content: 'Link',
        style: { color: '#d983a6' }
      }
    });

  toAdd('image') &&
    bm.add('image', {
      ...commonBlockProps,
      activate: true,
      label: opts.labelImage,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z" />
      </svg>`,
      content: {
        style: { color: 'black' },
        type: 'image',
      }
    });

  toAdd('video') &&
    bm.add('video', {
      ...commonBlockProps,
      label: opts.labelVideo,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
      </svg>`,
      content: {
        type: 'video',
        src: 'img/video2.webm',
        style: {
          height: '350px',
          width: '615px'
        }
      }
    });

  toAdd('map') &&
    bm.add('map', {
      ...commonBlockProps,
      label: opts.labelMap,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3M10,5.47L14,6.87V18.53L10,17.13V5.47M5,6.46L8,5.45V17.15L5,18.31V6.46M19,17.54L16,18.55V6.86L19,5.7V17.54Z" />
      </svg>`,
      content: {
        type: 'map',
        style: { height: '350px' }
      }
    });
}
