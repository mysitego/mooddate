import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';
import App from './App';

enableScreens();

registerRootComponent(App);
