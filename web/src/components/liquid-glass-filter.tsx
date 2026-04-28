export function LiquidGlassFilter() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      focusable="false"
    >
      <defs>
        <filter
          id="liquid-glass"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.0035 0.010"
            numOctaves={2}
            seed={14}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.8" result="soft-noise" />
          <feColorMatrix
            in="soft-noise"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 0 0 0
              0 0 0 1 0
            "
            result="vector-field"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="vector-field"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="alpha-blur" />
          <feSpecularLighting
            in="alpha-blur"
            surfaceScale="2.2"
            specularConstant="0.9"
            specularExponent="18"
            lightingColor="#ffffff"
            result="specular"
          >
            <fePointLight x="-160" y="-110" z="180" />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceAlpha" operator="in" result="rim-light" />
          <feBlend in="refracted" in2="rim-light" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
