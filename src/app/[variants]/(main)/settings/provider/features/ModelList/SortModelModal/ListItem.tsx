import { ModelIcon } from '@hermeslabs/icons';
import { SortableList } from '@hermeslabs/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AiProviderModelListItem } from '../../../../../../../../../packages/model-bank/src/types/aiModel';

const ListItem = memo<AiProviderModelListItem>(({ id, displayName }) => {
  return (
    <>
      <Flexbox gap={8} horizontal>
        <ModelIcon model={id} size={24} type={'avatar'} />
        {displayName || id}
      </Flexbox>
      <SortableList.DragHandle />
    </>
  );
});

export default ListItem;
