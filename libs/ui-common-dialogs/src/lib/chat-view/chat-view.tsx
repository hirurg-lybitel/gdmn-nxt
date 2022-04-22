import { NLPDialog } from '@gsbelarus/util-api-types';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import styles from './chat-view.module.less';

/* eslint-disable-next-line */
export interface ChatViewProps {}

interface IChatInputProps {
  onInputText: (text: string) => void;
};

const ChatInput = ({ onInputText }: IChatInputProps) => {
  const [text, setText] = useState('');
  const [prevText, setPrevText] = useState('');

  const onInputPressEnter = useCallback( (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const trimText = text.trim();

    if (e.key === 'Enter' && trimText) {
      setText('');
      setPrevText(trimText);
      onInputText(trimText);
      e.preventDefault();
    }
  }, [text, prevText]);

  const onInputArrowUp = useCallback( (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const trimText = text.trim();

    if (e.key === 'ArrowUp' && !trimText) {
      setText(prevText);
    }
  }, [text, prevText]);

  const onInputChange = useCallback( (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value), []);

  return (
    <textarea
      className={styles['NLPInput']}
      spellCheck={false}
      value={text}
      onKeyPress={onInputPressEnter}
      onKeyDown={onInputArrowUp}
      onChange={onInputChange}
    />
  );
};

const topGap = 24;
const scrollTimerDelay = 4000;

interface IChatViewState {
  showFrom: number;
  showTo: number;
  partialOK: boolean;
  recalc: boolean;
  scrollVisible: boolean;
  scrollTimer: any;
  prevClientY?: number;
  prevFrac: number;
};

const defState: IChatViewState = {
  showFrom: -1,
  showTo: -1,
  partialOK: true,
  recalc: true,
  scrollVisible: false,
  scrollTimer: undefined,
  prevClientY: -1,
  prevFrac: 0
};

export function ChatView(props: ChatViewProps) {
  const [state, setState] = useState(defState);
  const [nlpDialog, setNLPDialog] = useState<NLPDialog>([]);

  const shownItems = useRef<HTMLDivElement[]>([]);
  const scrollThumb = useRef<HTMLDivElement | null>(null);

  const { showFrom, showTo, scrollTimer, prevClientY, prevFrac, recalc, partialOK } = state;

  const sf = (showFrom === -1 && nlpDialog.length) ? nlpDialog.length - 1 : showFrom;
  const st = (showTo === -1 && nlpDialog.length) ? nlpDialog.length - 1 : showTo;

  const thumbHeight = nlpDialog.length ? `${Math.trunc(((st - sf + 1) / nlpDialog.length) * 100).toString()}%` : '100%';
  const thumbTop = nlpDialog.length ? `${Math.trunc((sf / nlpDialog.length) * 100).toString()}%` : '100%';

  shownItems.current = [];

  useEffect( () => {
    if (!recalc) return;

    if (shownItems.current.length) {
      if (shownItems.current[0].offsetTop > topGap) {
        if (shownItems.current.length < nlpDialog.length && sf > 0) {
          setState( state => ({
            ...state,
            showFrom: sf - 1,
            showTo: st
          }));
        } else {
          setState( state => ({
            ...state,
            showFrom: sf,
            showTo: st,
            recalc: false
          }));
        }
      } else if (shownItems.current[0].offsetTop + shownItems.current[0].offsetHeight < 0 && sf < st) {
        setState(state => ({
          ...state,
          showFrom: sf + 1,
          showTo: st,
          recalc: true
        }));
      } else if (shownItems.current[0].offsetTop < 0 && !partialOK && !showFrom && showFrom < showTo) {
        setState( state => ({
          ...state,
          showFrom: sf,
          showTo: st - 1,
          recalc: false
        }));
      } else {
        setState( state => ({
          ...state,
          showFrom: sf,
          showTo: st,
          recalc: false
        }));
      }
    } else {
      setState( state => ({
        ...state,
        showFrom: 0,
        showTo: 0,
        recalc: false
      }));
    }
  }, [nlpDialog, recalc, partialOK, showFrom, showTo]);

  const onWheel = useCallback( (e: React.WheelEvent<HTMLDivElement>) => {
    const delayedScrollHide = () => ({
      scrollVisible: true,
      scrollTimer: setTimeout( () => setState( state => ({ ...state, scrollVisible: false, scrollTimer: undefined }) ), scrollTimerDelay)
    });

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    if (e.deltaY < 0) {
      if (showFrom > 0) {
        setState( state => ({
          ...state,
          showFrom: showFrom - 1,
          showTo: showTo - 1,
          partialOK: false,
          recalc: true,
          ...delayedScrollHide()
        }));
      } else {
        setState( state => ({
          ...state,
          partialOK: false,
          recalc: true,
          ...delayedScrollHide()
        }));
      }
    } else if (e.deltaY > 0 && showTo < nlpDialog.length - 1) {
      setState( state => ({
        ...state,
        showFrom: showFrom + 1,
        showTo: showTo + 1,
        partialOK: true,
        recalc: true,
        ...delayedScrollHide()
      }));
    } else {
      setState( state => ({
        ...state,
        ...delayedScrollHide()
      }));
    }
  }, [showFrom, showTo, scrollTimer]);

  const onPointerDown = useCallback( (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.currentTarget === e.target && scrollThumb.current) {
      const above = e.clientY <= scrollThumb.current.getBoundingClientRect().top;
      const page = showTo - showFrom + 1;
      let newFrom: number;
      let newTo: number;

      if (above) {
        newFrom = showFrom - page;
        newTo = showTo - page;
      } else {
        newFrom = showFrom + page;
        newTo = showTo + page;
      }

      if (newFrom < 0) {
        newFrom = 0;
      }

      if (newFrom >= nlpDialog.length) {
        newFrom = nlpDialog.length - 1;
      }

      if (newTo < newFrom) {
        newTo = newFrom;
      }

      if (newTo >= nlpDialog.length) {
        newTo = nlpDialog.length - 1;
      }

      setState( state => ({
        ...state,
        showFrom: newFrom,
        showTo: newTo,
        partialOK: !above,
        recalc: true
      }));
    } else {
      e.currentTarget.setPointerCapture(e.pointerId);
      setState( state => ({
        ...state,
        scrollVisible: true,
        prevClientY: e.clientY,
        prevFrac: 0
      }));
    }
  }, [showFrom, showTo, nlpDialog]);

  const onPointerUp = useCallback( (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    setState( state => ({
      ...state,
      scrollVisible: true,
      scrollTimer: setTimeout(() => setState( state => ({ ...state, scrollVisible: false, scrollTimer: undefined }) ), scrollTimerDelay),
      prevClientY: undefined,
      prevFrac: 0
    }));
  }, [scrollTimer]);

  const onPointerMove = useCallback( (e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons === 1 && typeof prevClientY === 'number' && nlpDialog.length)) return;

    e.preventDefault();

    const deltaY = e.clientY - prevClientY;
    const deltaPrecise = deltaY / (e.currentTarget.clientHeight / nlpDialog.length);
    const deltaCorrected = deltaPrecise + prevFrac;
    const delta = Math.trunc(deltaCorrected);

    if (!delta) return;

    if (showFrom === 0 && delta < 0) {
      setState( state => ({
        ...state,
        partialOK: false,
        recalc: true
      }));
    } else {
      let newFrom = showFrom + delta;
      if (newFrom < 0) newFrom = 0;
      let newTo = showTo + delta;
      if (newTo >= nlpDialog.length) newTo = nlpDialog.length - 1;
      if (newFrom > newTo) newFrom = newTo;
      setState( state => ({
        ...state,
        showFrom: newFrom,
        showTo: newTo,
        partialOK: !!newFrom,
        recalc: true,
        prevClientY: e.clientY,
        prevFrac: deltaCorrected - delta
      }));
    }
  }, [nlpDialog, showFrom, showTo, prevClientY, prevFrac]);

  const onInputText = useCallback( (text: string) => {
    setState( state => ({
      ...state,
      showFrom: -1,
      showTo: -1,
      partialOK: true,
      recalc: true
    }));
    setNLPDialog( nlpDialog => ([
      ...nlpDialog,
      { id: crypto.randomUUID(), who: 'me', text },
      { id: crypto.randomUUID(), who: 'it', text: new Date().toISOString() }
    ]) )
  }, []);

  return (
    <Fragment>
      <div className={styles['NLPDialog']}>
        <div className={styles['NLPItems']}>
          <div className={styles['NLPItemsFlex']} onWheel={onWheel}>
            {nlpDialog.map(
                (i, idx) =>
                  idx >= sf &&
                  idx <= st && (
                    <div
                      key={i.id}
                      className={`${styles['NLPItem']} ${i.who === 'me' ? styles['NLPItemRight'] : styles['NLPItemLeft']}`}
                      ref={elem => elem && shownItems.current.push(elem)}
                    >
                    {
                      i.who === 'me' ?
                        <>
                          <span className={`${styles['Message']} ${styles['MessageRight']}`}>{i.text}</span>
                          <span className={styles['Circle']}>{i.who}</span>
                        </>
                      :
                        <>
                          <span className={styles['Circle']}>{i.who}</span>
                          <span className={`${styles['Message']} ${styles['MessageLeft']}`}>{i.text}</span>
                        </>
                    }
                    </div>
                  )
              )}
            <div
              className={styles[state.scrollVisible ? 'NLPScrollBarVisible' : 'NLPScrollBar']}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerMove={onPointerMove}
            >
              <div
                className={styles['NLPScrollBarThumb']}
                style={{ height: thumbHeight, top: thumbTop }}
                ref={scrollThumb}
              />
            </div>
          </div>
        </div>
        <ChatInput onInputText={onInputText} />
      </div>
      <svg height="0" width="0">
        <defs>
          <clipPath id="left-droplet">
            <path d="M 10,0 A 10,10 0 0 1 0,10 H 16 V 0 Z" />
          </clipPath>
          <clipPath id="right-droplet">
            <path d="M 6,0 A 10,10 0 0 0 16,10 H 0 V 0 Z" />
          </clipPath>
        </defs>
      </svg>
    </Fragment>
  );
};

export default ChatView;
