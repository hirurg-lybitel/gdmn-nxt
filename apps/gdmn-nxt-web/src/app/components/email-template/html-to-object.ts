import { IComponent, componentTypes } from './email-template';

export const emailTemplateBaseName = 'gs_emailtemplate';
export const emailTemplateTextName = emailTemplateBaseName + 'Text';
export const emailTemplateButtonName = emailTemplateBaseName + 'Button';
export const emailTemplateDividerName = emailTemplateBaseName + 'Divider';
export const emailTemplateImageName = emailTemplateBaseName + 'Image';

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
          [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]]; // Меняем значения переменных
        }
      }
    }
    return newArr;
  };
  const getObjectFromHtml = (html: Element, type: componentTypes): IComponent => {
    const container = html as any;
    const children = container.children[0] as any;
    const getPadding = (style: any) => {
      const normilize = (str: string) => Number(str.replace('px', ''));
      if (style.padding.split(' ').length === 1) {
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
    const getWidth = (style: any) => {
      const width = style.width;
      if (width === 'auto') {
        return {
          auto: true,
          value: 100
        };
      }
      return {
        auto: false,
        value: Number(width.replace('%', ''))
      };
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
        object.padding = getPadding(children.style);
        object.color = {
          text: children.style.color === 'rgb(209, 204, 204)' ? children.style.color : '#fff',
          textAuto: children.style.color === 'rgb(209, 204, 204)',
          button: children.style.backgroundColor
        };
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
    object.margin = getPadding(container.style);
    object.position = container.style.justifyContent;
    object.width = getWidth(children.style);

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

  const backgroundColor = htmlObject.getElementsByTagName('body')[0].style.backgroundColor;

  return {
    components: sortObjects,
    background: {
      value: backgroundColor === 'transparent' ? 'rgba(255,255,255)' : backgroundColor,
      isView: backgroundColor !== 'transparent'
    }
  };
};