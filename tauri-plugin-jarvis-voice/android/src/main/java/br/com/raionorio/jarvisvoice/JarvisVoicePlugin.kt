package br.com.raionorio.jarvisvoice

import android.app.Activity
import android.media.AudioAttributes
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import java.util.Locale

@InvokeArg
class SpeakArgs {
    var text: String? = null
}

@TauriPlugin
class JarvisVoicePlugin(private val activity: Activity) : Plugin(activity) {
    private var textToSpeech: TextToSpeech? = null
    private var isReady: Boolean = false
    private var isInitializing: Boolean = false
    private var pendingText: String? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    init {
        Log.i("JarvisVoicePlugin", "Plugin criado. Inicializando voz.")
        initializeVoice()
    }

    private fun initializeVoice() {
        if (isInitializing || isReady) {
            return
        }

        isInitializing = true

        textToSpeech = TextToSpeech(activity) { status ->
            mainHandler.post {
                Log.i("JarvisVoicePlugin", "Callback TextToSpeech status=$status")

                isInitializing = false

                if (status != TextToSpeech.SUCCESS) {
                    Log.e("JarvisVoicePlugin", "Falha ao iniciar TextToSpeech. status=$status")
                    isReady = false
                    return@post
                }

                val tts = textToSpeech

                if (tts == null) {
                    Log.e("JarvisVoicePlugin", "TextToSpeech ficou nulo.")
                    isReady = false
                    return@post
                }

                tts.setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )

                val languageResult = tts.setLanguage(Locale("pt", "BR"))

                Log.i("JarvisVoicePlugin", "Resultado setLanguage pt-BR=$languageResult")

                if (
                    languageResult == TextToSpeech.LANG_MISSING_DATA ||
                    languageResult == TextToSpeech.LANG_NOT_SUPPORTED
                ) {
                    Log.w("JarvisVoicePlugin", "pt-BR indisponível. Usando idioma padrão.")
                    tts.setLanguage(Locale.getDefault())
                }

                tts.setSpeechRate(0.92f)
                tts.setPitch(0.85f)

                isReady = true

                val textToSpeak = pendingText
                pendingText = null

                if (!textToSpeak.isNullOrBlank()) {
                    speakInternal(textToSpeak)
                }
            }
        }
    }

    @Command
    fun speak(invoke: Invoke) {
        val args = invoke.parseArgs(SpeakArgs::class.java)
        val text = args.text ?: "Estou na escuta, Mestre."

        Log.i("JarvisVoicePlugin", "Comando speak recebido: $text")

        mainHandler.post {
            if (!isReady) {
                Log.i("JarvisVoicePlugin", "TTS ainda não pronto. Guardando fala pendente.")
                pendingText = text
                initializeVoice()
            } else {
                speakInternal(text)
            }
        }

        val ret = JSObject()
        ret.put("success", true)
        ret.put("message", "Comando de fala enviado ao Android.")
        invoke.resolve(ret)
    }

    private fun speakInternal(text: String) {
        val result = textToSpeech?.speak(
            text,
            TextToSpeech.QUEUE_FLUSH,
            null,
            "jarvis-native-speak"
        )

        Log.i("JarvisVoicePlugin", "Resultado speak=$result texto=$text")
    }
}
