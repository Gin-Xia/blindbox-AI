import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei'

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1.5} position={[0, -0.5, 0]} />
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-popmart-pink border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/60 text-sm whitespace-nowrap">加载模型中...</p>
      </div>
    </Html>
  )
}

interface Props {
  glbUrl: string
  onReset: () => void
}

export default function ModelViewer({ glbUrl, onReset }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const downloadUrl = glbUrl

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* 3D Canvas */}
      <div
        ref={canvasRef}
        className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-purple-950/50 to-black/80"
      >
        <Canvas
          camera={{ position: [0, 1, 3], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, 2, -5]} intensity={0.4} color="#FF6B9D" />

          <Suspense fallback={<LoadingFallback />}>
            <GLBModel url={glbUrl} />
            <Environment preset="city" />
          </Suspense>

          <OrbitControls
            autoRotate
            autoRotateSpeed={2}
            enableZoom
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI * 0.8}
          />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <a
          href={downloadUrl}
          download={`blindbox-${Date.now()}.glb`}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-sm font-semibold transition-colors flex items-center gap-2"
        >
          ⬇️ 下载GLB
        </a>
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-popmart-pink to-popmart-purple text-white text-sm font-semibold hover:scale-105 transition-transform"
        >
          🎁 再做一个
        </button>
      </div>

      <p className="text-center text-white/30 text-xs">
        拖拽旋转 · 滚轮缩放 · 自动旋转展示
      </p>
    </div>
  )
}
