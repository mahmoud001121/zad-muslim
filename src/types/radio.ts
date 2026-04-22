export interface RadioStation {
  id: number;
  name: string;
  nameEn: string;
  url: string;
  img: string;
  description: string;
  country: string;
  genres: string[];
  frequency: string;
}

export interface RadioPlayerState {
  activeStation: RadioStation | null;
  isPlaying: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage: string | null;
  volume: number;
}
