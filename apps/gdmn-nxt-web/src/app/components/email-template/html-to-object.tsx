import { renderToStaticMarkup } from 'react-dom/server';
import { IComponent, ITemplateEdit, componentTypes } from './email-template';
import EmailTemplateItem from './email-template-item/email-template-item';

export const emailTemplateBaseName = 'gs_emailtemplate';
export const emailTemplateTextName = emailTemplateBaseName + 'Text';
export const emailTemplateButtonName = emailTemplateBaseName + 'Button';
export const emailTemplateDividerName = emailTemplateBaseName + 'Divider';
export const emailTemplateImageName = emailTemplateBaseName + 'Image';
export const emailTemplateContainerName = emailTemplateBaseName + 'Container';
export const emailTemplateMarginAuto = emailTemplateBaseName + 'AutoMargin';
export const emailTemplatePaddingAuto = emailTemplateBaseName + 'AutoPadding';
export const emailTemplateTextColor = emailTemplateBaseName + 'TextColor_';
export const emailTemplateWidth = emailTemplateBaseName + 'Width_';
export const emailTemplateURL = emailTemplateBaseName + 'URL_';
export const hexToRGB = (h: any) => {
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (h?.length === 4) {
    r = h[1] + h[1];
    g = h[2] + h[2];
    b = h[3] + h[3];

  // 6 digits
  } else if (h?.length === 7) {
    r = parseInt(h[1] + h[2], 16);
    g = parseInt(h[3] + h[4], 16);
    b = parseInt(h[5] + h[6], 16);
  }

  return { r, g, b };
};

const rgbToHex = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '')
    .replace(/\s/g, '')
    .split(',');

  if (isNaN(Number(rgb[0])) || isNaN(Number(rgb[1])) || isNaN(Number(rgb[2]))) return value;
  // Helper function to convert one color value
  const toHex = (colorValue: number): string => {
    const hex = colorValue.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  // Ensure values are within range and call the helper function
  return '#' + toHex(Math.max(0, Math.min(255, Number(rgb[0])))) +
                 toHex(Math.max(0, Math.min(255, Number(rgb[1])))) +
                 toHex(Math.max(0, Math.min(255, Number(rgb[2]))));
};

export const htmlToTemplateObject = (componentsHtml: string): {
  components: IComponent[],
  background: {
    value: string,
    isView: boolean
  }
} => {
  const bubbleSort = (arr: any[]) => {
    const newArr = [...arr];
    for (let i = 0; i < newArr.length; i++) {
      for (let j = 0; j < newArr.length - i; j++) {
        if (newArr[j]?.index > newArr[j + 1]?.index) {
          [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]];
        }
      }
    }
    return newArr;
  };
  const getObjectFromHtml = (html: Element, type: componentTypes): IComponent => {
    const container = html as any;
    const children = container.children[0] as any;
    const getPadding = (style: any, auto: boolean) => {
      const normilize = (str: string) => Number(str.replace('px', ''));
      if (auto) {
        return {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
          isCommon: true,
          common: normilize(style.paddingTop)
        };
      }
      return {
        top: normilize(style.paddingTop),
        right: normilize(style.paddingRight),
        bottom: normilize(style.paddingBottom),
        left: normilize(style.paddingLeft),
        isCommon: false,
        common: 10
      };
    };
    const getWidth = (element: any) => {
      const widthPosition = element.classList.value.search(emailTemplateWidth);
      let width = '';
      let cycle = widthPosition !== -1;
      let i = widthPosition + emailTemplateWidth.length;

      while (cycle) {
        const value = element.classList.value[i];
        if (!value || isNaN(Number(value))) {
          cycle = false;
          break;
        }
        width += element.classList.value[i];
        i += 1;
      }

      return {
        auto: element.style.width === 'auto',
        value: (widthPosition === -1) ? 100 : Number(width)
      };
    };

    const getURL = (element: any) => {
      const urlPosition = element.classList.value.search(emailTemplateURL);
      let url = '';
      let cycle = urlPosition !== -1;
      let i = urlPosition + emailTemplateURL.length;

      while (cycle) {
        const value = element.classList.value[i];
        if (!value || value === '' || value === ' ') {
          cycle = false;
          break;
        }
        url += element.classList.value[i];
        i += 1;
      }
      return url;
    };

    const checkNullStr = (str: string) => str === '' ? undefined : str;
    const checkNullStrNumber = (str: string) => str === '' ? undefined : Number(str);
    const object: any = {};

    switch (type) {
      case 'text': {
        object.text = children.innerHTML;
        object.type = 'text';
        object.title = 'Текст';
        break;
      }
      case 'image':{
        object.type = 'image';
        object.title = 'Картинка';
        object.image = children.src;
        break;
      }
      case 'button':{
        object.type = 'button';
        object.title = 'Кнопка';
        object.padding = getPadding(children.style, children.classList.value.search(emailTemplatePaddingAuto) !== -1);
        const autoTextColor = () => {
          const colorPosition = children.classList.value.search(emailTemplateTextColor);
          let width = '';
          let cycle = colorPosition !== -1;
          let i = colorPosition + emailTemplateTextColor.length;
          while (cycle) {
            const value = children.classList.value[i];
            if (!value || value === ' ') {
              cycle = false;
              break;
            }
            width += children.classList.value[i];
            i += 1;
          }
          return width;
        };
        object.color = {
          text: autoTextColor() !== '' ? autoTextColor() : '#ffffff',
          textAuto: children.style.color === 'black' || children.style.color === 'white',
          button: rgbToHex(children.style.backgroundColor)
        };
        object.url = getURL(children);
        object.font = {
          size: checkNullStrNumber(children.style.fontSize.replace('px', '')) || 14,
          value: checkNullStr(children.style.fontFamily.replaceAll('\"', '')) || 'Arial'
        };
        object.text = children.innerHTML;
        break;
      }
      case 'divider':{
        object.type = 'divider';
        object.title = 'Разделитель';
        break;
      }
    }

    object.index = Number(children.id);
    object.id = Number(container.id);
    object.margin = getPadding(container.style, container.classList.value.search(emailTemplateMarginAuto) !== -1);
    object.position = container.style.textAlign || 'center';
    object.width = getWidth(children);

    return object;
  };

  const getObjects = (html: HTMLCollectionOf<Element>, type: componentTypes): IComponent[] => {
    const objects: IComponent[] = [];
    for (let i = 0;i < html.length;i++) {
      objects.push(getObjectFromHtml(html[i], type));
    }
    return objects;
  };

  const htmlObject = document.createElement('html');
  htmlObject.innerHTML = componentsHtml;
  const buttons = htmlObject.getElementsByClassName(emailTemplateButtonName);
  const texts = htmlObject.getElementsByClassName(emailTemplateTextName);
  const dividers = htmlObject.getElementsByClassName(emailTemplateDividerName);
  const images = htmlObject.getElementsByClassName(emailTemplateImageName);
  const buttonObjects = getObjects(buttons, 'button');
  const textObjects = getObjects(texts, 'text');
  const dividerObjects = getObjects(dividers, 'divider');
  const imageObjects = getObjects(images, 'image');
  const objects: IComponent[] = [...buttonObjects, ...textObjects, ...dividerObjects, ...imageObjects];
  const sortObjects: IComponent[] = bubbleSort(objects).map(obj => ({ ...obj, index: undefined }));

  const backgroundColor = rgbToHex((htmlObject.getElementsByClassName(emailTemplateContainerName)[0] as any)?.style.backgroundColor);

  return {
    components: sortObjects,
    background: {
      value: !backgroundColor || backgroundColor === 'transparent' ? getComputedStyle(document.documentElement).getPropertyValue('--color-card-bg') : backgroundColor,
      isView: backgroundColor !== 'transparent'
    }
  };
};

export const objectToHtml = (template: ITemplateEdit) => {
  return renderToStaticMarkup(
    <div
      className={emailTemplateContainerName}
      style={{
        height: '100%',
        width: '100%',
        background: template.background.isView ? template.background.value : 'transparent'
      }}
    >
      <div>
        {template.components.map((component: IComponent, index: number) => (
          <EmailTemplateItem
            key={index}
            index={index}
            isPreview={true}
            component={component}
            background={template.background.value}
          />
        ))}
      </div>
    </div>
  );
};
