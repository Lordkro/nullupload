declare module 'piexifjs' {
  interface TagValues {
    [tagId: number]: any
  }

  interface ExifData {
    '0th': TagValues
    Exif: TagValues
    GPS: TagValues
    Interop: TagValues
    '1st': TagValues
    thumbnail: string | null
  }

  interface ImageIFD {
    Make: number
    Model: number
    Orientation: number
    XResolution: number
    YResolution: number
    Software: number
    DateTime: number
    Artist: number
    Copyright: number
    ImageDescription: number
    [key: string]: number
  }

  interface ExifIFD {
    ExposureTime: number
    FNumber: number
    ISOSpeedRatings: number
    DateTimeOriginal: number
    DateTimeDigitized: number
    ShutterSpeedValue: number
    ApertureValue: number
    FocalLength: number
    LensMake: number
    LensModel: number
    PixelXDimension: number
    PixelYDimension: number
    [key: string]: number
  }

  interface GPSIFD {
    GPSLatitude: number
    GPSLatitudeRef: number
    GPSLongitude: number
    GPSLongitudeRef: number
    GPSAltitude: number
    GPSAltitudeRef: number
    GPSTimeStamp: number
    GPSDateStamp: number
    [key: string]: number
  }

  const TAGS: {
    '0th': Record<number, string>
    Exif: Record<number, string>
    GPS: Record<number, string>
    Interop: Record<number, string>
    '1st': Record<number, string>
  }

  const ImageIFD: ImageIFD
  const ExifIFD: ExifIFD
  const GPSIFD: GPSIFD

  function load(data: string): ExifData
  function dump(exifData: ExifData): string
  function insert(exifStr: string, jpegData: string): string
  function remove(jpegData: string): string
}
