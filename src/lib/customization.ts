

export type ElementType = 'text' | 'image' | 'ai-image' | 'qr-code' | 'clipart';

interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  outlineColor?: string;
  outlineWidth?: number;
  curve?: number; // -100 to 100, where 0 is straight
}

export interface ImageElement extends BaseElement {
  type: 'image' | 'ai-image' | 'clipart';
  src: string; // URL to the image
}

export interface QrCodeElement extends BaseElement {
  type: 'qr-code';
  value: string; // The URL or text for the QR code
  color: string;
  hasBackground: boolean;
  backgroundColor: string;
}

export type CustomizationElement = TextElement | ImageElement | QrCodeElement;
