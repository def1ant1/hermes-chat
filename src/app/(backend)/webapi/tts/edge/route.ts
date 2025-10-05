import { EdgeSpeechPayload, EdgeSpeechTTS } from '@hermeslabs/tts';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  const payload = (await req.json()) as EdgeSpeechPayload;

  return await EdgeSpeechTTS.createRequest({ payload });
};
