import ConfirmSwapContent from 'src/shared/components/ModalContent/ConfirmSwapContent';
import show from './show';

export default (props) => {
  show(
    ConfirmSwapContent,
    {
      title: 'Select Token',
    },
    props,
  );
};