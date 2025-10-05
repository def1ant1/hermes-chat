import { PluginSchema } from '@hermeslabs/types';
import { Form, Markdown } from '@hermeslabs/ui';
import { Form as AForm } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import type { JSONSchema7 } from 'json-schema';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import ItemRender from '../../components/JSONSchemaConfig/ItemRender';

export const transformPluginSettings = (pluginSettings: PluginSchema) => {
  if (!pluginSettings?.properties) return [];

  const schemaEntries = Object.entries(pluginSettings.properties) as Array<[string, JSONSchema7]>;

  return schemaEntries.map(([name, schema]) => ({
    desc: schema.description,
    enum: schema.enum,
    format: schema.format,
    label: (schema.title as string | undefined) || name,
    maximum: schema.maximum,
    minimum: schema.minimum,
    name,
    tag: name,
    type: schema.type,
  }));
};

interface PluginSettingsConfigProps {
  id: string;
  schema: PluginSchema;
}

const useStyles = createStyles(({ css, token }) => ({
  markdown: css`
    p {
      color: ${token.colorTextDescription};
    }
  `,
}));

const PluginSettingsConfig = memo<PluginSettingsConfigProps>(({ schema, id }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('setting');

  const [updatePluginSettings] = useToolStore((s) => [s.updatePluginSettings]);
  const pluginSetting = useToolStore(pluginSelectors.getPluginSettingsById(id), isEqual);

  const [form] = AForm.useForm();

  const items = transformPluginSettings(schema);

  return (
    <Form
      footer={
        <Form.SubmitFooter
          texts={{
            reset: t('submitFooter.reset'),
            submit: t('submitFooter.submit'),
            unSaved: t('submitFooter.unSaved'),
            unSavedWarning: t('submitFooter.unSavedWarning'),
          }}
        />
      }
      form={form}
      gap={16}
      initialValues={pluginSetting}
      items={items.map((item) => ({
        children: (
          <ItemRender
            enum={item.enum}
            format={item.format}
            maximum={item.maximum}
            minimum={item.minimum}
            type={item.type as any}
          />
        ),
        desc: item.desc && (
          <Markdown className={styles.markdown} variant={'chat'}>
            {item.desc as string}
          </Markdown>
        ),
        key: item.label,
        label: item.label,
        name: item.name,
        tag: item.tag,
        valuePropName: item.type === 'boolean' ? 'checked' : undefined,
      }))}
      itemsType={'flat'}
      layout={'vertical'}
      onFinish={async (v) => {
        await updatePluginSettings(id, v);
      }}
      variant={'borderless'}
    />
  );
});

export default PluginSettingsConfig;
