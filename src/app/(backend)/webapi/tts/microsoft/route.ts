import { MicrosoftSpeechPayload, MicrosoftSpeechTTS } from '@hermeslabs/tts';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as MicrosoftSpeechPayload;

  return await MicrosoftSpeechTTS.createRequest({ payload });
};
