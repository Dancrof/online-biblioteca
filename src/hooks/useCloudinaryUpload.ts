import { useCallback } from 'react';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../Config/constant';

// Declaración del tipo global para Cloudinary
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: CloudinaryWidgetOptions,
        callback: (error: CloudinaryError | null, result: CloudinaryWidgetResult) => void
      ) => CloudinaryWidget;
    };
  }
}

interface CloudinaryError {
  message?: string;
  statusText?: string;
  [key: string]: unknown;
}

interface CloudinaryWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  sources?: string[];
  multiple?: boolean;
  maxFiles?: number;
  cropping?: boolean;
  croppingAspectRatio?: number;
  folder?: string;
  tags?: string[];
  resourceType?: string;
  clientAllowedFormats?: string[];
  maxImageFileSize?: number;
  maxImageWidth?: number;
  maxImageHeight?: number;
  theme?: string;
  styles?: Record<string, Record<string, string>>;
}

interface CloudinaryWidgetResult {
  event: string;
  info: {
    secure_url?: string;
    public_id?: string;
    format?: string;
    resource_type?: string;
    [key: string]: unknown;
  };
}

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

interface UseCloudinaryUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  folder?: string;
  cropping?: boolean;
  multiple?: boolean;
}

/**
 * Hook personalizado para manejar la subida de imágenes a Cloudinary
 * 
 * @param options - Opciones de configuración
 * @returns Función para abrir el widget de Cloudinary
 */
export const useCloudinaryUpload = (options: UseCloudinaryUploadOptions = {}) => {
  const { onSuccess, onError, folder = 'libros', cropping = true, multiple = false } = options;

  const openUploadWidget = useCallback(() => {
    if (!window.cloudinary) {
      const errorMsg = 'Cloudinary widget no está disponible. Verifica que el script esté cargado.';
      console.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple,
        maxFiles: multiple ? 10 : 1,
        cropping,
        croppingAspectRatio: 0.75, // Ratio común para portadas de libros
        folder,
        tags: ['libro', 'portada'],
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxImageFileSize: 5000000, // 5MB
        maxImageWidth: 2000,
        maxImageHeight: 3000,
        theme: 'default',
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1',
          },
        },
      },
      (error: CloudinaryError | null, result: CloudinaryWidgetResult) => {
        if (error) {
          console.error('Error al subir imagen:', error);
          onError?.(error.message || 'Error al subir la imagen');
          return;
        }

        if (result.event === 'success') {
          const imageUrl = result.info.secure_url;
          if (imageUrl) {
            console.log('Imagen subida exitosamente:', imageUrl);
            onSuccess?.(imageUrl);
          }
        }

        // Cerrar el widget después de una subida exitosa
        if (result.event === 'success') {
          widget.close();
        }
      }
    );

    widget.open();
  }, [onSuccess, onError, folder, cropping, multiple]);

  return { openUploadWidget };
};
