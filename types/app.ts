export interface TextSettings {
  bottomText: string
  koreanText: string
  verticalText: string
  middleText: string
  topText: string
  remainingChars: number
}

export interface AppSettings {
  imageStyles: Array<{
    width: number
    height: number
    top: number
    left: number
  }>
  textSettings: TextSettings
  selectedFilter: string
  filterIntensity: number
  selectedFrame: string
  developerMode: boolean
} 