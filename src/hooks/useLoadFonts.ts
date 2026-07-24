import { useFonts } from 'expo-font'
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins'

export function useLoadFonts() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Agrandir: require('../../assets/fonts/Agrandir.ttf'),
  })

  return { fontsLoaded: loaded, fontsError: error }
}
