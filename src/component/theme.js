import {cyan500, cyan700, lightBlack, red700, grey500, darkBlack, white, grey300} from 'material-ui/styles/colors';
import ColorManipulator from 'material-ui/utils/color-manipulator';
import Spacing from 'material-ui/styles/spacing';
import zIndex from 'material-ui/styles/zIndex';

export default {
    spacing: Spacing,
    zIndex: zIndex,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: cyan500,
        primary2Color: cyan700,
        primary3Color: lightBlack,
        accent1Color: cyan700,
        accent2Color: red700,
        accent3Color: grey500,
        textColor: darkBlack,
        alternateTextColor: white,
        canvasColor: white,
        borderColor: grey300,
        disabledColor: ColorManipulator.fade(darkBlack, 0.3),
        pickerHeaderColor: cyan500,
    }
};