anime_state = $00

.segment "HEADER"
  ; .byte "NES", $1A      ; iNES header identifier
  .byte $4E, $45, $53, $1A
  .byte 2               ; 2x 16KB PRG code
  .byte 1               ; 1x  8KB CHR data
  .byte $01, $00        ; mapper 0, vertical mirroring

.segment "VECTORS"
  ;; When an NMI happens (once per frame if enabled) the label nmi:
  .addr nmi
  ;; When the processor first turns on or is reset, it will jump to the label reset:
  .addr reset
  ;; External interrupt IRQ (unused)
  .addr 0

; "nes" linker config requires a STARTUP section, even if it's empty
.segment "STARTUP"

; Main code segment for the program
.segment "CODE"

reset:
  sei		; disable IRQs
  cld		; disable decimal mode
  ldx #$40
  stx $4017	; disable APU frame IRQ
  ldx #$ff 	; Set up stack
  txs		;  .
  inx		; now X = 0
  stx $2000	; disable NMI
  stx $2001 	; disable rendering
  stx $4010 	; disable DMC IRQs

;; first wait for vblank to make sure PPU is ready
vblankwait1:
  bit $2002
  bpl vblankwait1

clear_memory:
  lda #$00
  sta $0000, x
  sta $0100, x
  sta $0200, x
  sta $0300, x
  sta $0400, x
  sta $0500, x
  sta $0600, x
  sta $0700, x
  inx
  bne clear_memory

;; second wait for vblank, PPU is ready after this
vblankwait2:
  bit $2002
  bpl vblankwait2

main:
load_palettes:
  lda $2002
  lda #$3f
  sta $2006
  lda #$00
  sta $2006
  ldx #$00
@loop:
  lda palettes, x
  sta $2007
  inx
  cpx #$20
  bne @loop

enable_rendering:
  lda #%10000000	; Enable NMI
  sta $2000
  lda #%00010000	; Enable Sprites
  sta $2001

forever:
  jsr animate
  jmp forever

animate:
  lda anime_state
  cmp #0
  bne anime_two
anime_one:
  lda #0
  jmp anime_end
anime_two:
  lda #1
  jmp anime_end
anime_end:
  sta anime_state
  rts

nmi:
  ldx #$00 	; Set SPR-RAM address to 0
  stx $2003
@loop:	lda unisinos, x 	; Load the hello message into SPR-RAM
  sta $2004
  inx
  cpx #$2c
  bne @loop
  rti

unisinos:
  .byte $00, $00, $00, $00 	; Why do I need these here?
  .byte $00, $00, $00, $00
  .byte $6c, $00, $00, $5d  ; u
  .byte $6c, $01, $00, $67  ; n
  .byte $6c, $02, $00, $71  ; i
  .byte $6c, $03, $00, $7b  ; s
  .byte $6c, $02, $00, $85  ; i
  .byte $6c, $01, $00, $8f  ; n
  .byte $6c, $04, $00, $99  ; o
  .byte $6c, $03, $00, $a3  ; s
  .byte $e0, $05, $01, $10  ; sprite one

palettes:
  ; Background Palette
  .byte $00, $00, $00, $00
  .byte $00, $00, $00, $00
  .byte $00, $00, $00, $00
  .byte $00, $00, $00, $00

  ; Sprite Palette
  .byte $00, $02, $00, $00
  .byte $00, $0f, $36, $02
  .byte $00, $00, $00, $00
  .byte $00, $00, $00, $00

; Character memory
.segment "CHARS"
  .byte %11000011	; U (00)
  .byte %11000011
  .byte %11000011
  .byte %11000011
  .byte %11000011
  .byte %11000011
  .byte %11111111
  .byte %11111111
  .byte $00, $00, $00, $00, $00, $00, $00, $00

  .byte %11000011	; N (01)
  .byte %11000011
  .byte %11100011
  .byte %11110011
  .byte %11011011
  .byte %11001111
  .byte %11000111
  .byte %11000011
  .byte $00, $00, $00, $00, $00, $00, $00, $00

  .byte %00011000	; L (02)
  .byte %00011000
  .byte %00011000
  .byte %00011000
  .byte %00011000
  .byte %00011000
  .byte %00011000
  .byte %00011000
  .byte $00, $00, $00, $00, $00, $00, $00, $00

  .byte %01111110	; S (03)
  .byte %11100111
  .byte %11000000
  .byte %11100000
  .byte %00111100
  .byte %00000111
  .byte %11100111
  .byte %01111110
  .byte $00, $00, $00, $00, $00, $00, $00, $00

  .byte %01111110	; O (04)
  .byte %11100111
  .byte %11000011
  .byte %11000011
  .byte %11000011
  .byte %11000011
  .byte %11100111
  .byte %01111110
  .byte $00, $00, $00, $00, $00, $00, $00, $00

  .byte %11111111	; sprite one (0) (05)
  .byte %00110000
  .byte %00101010
  .byte %00100000
  .byte %01010010
  .byte %00111110
  .byte %00011110
  .byte %01111111

  .byte %00000000	; sprite one (1)
  .byte %00101110
  .byte %00111110
  .byte %00111110
  .byte %01001100
  .byte %00000000
  .byte %00100001
  .byte %00000000

  .byte %11111111	; sprite two (0) (06)
  .byte %00110000
  .byte %00101010
  .byte %00100000
  .byte %01010010
  .byte %00011110
  .byte %00111110
  .byte %01111111

  .byte %00000000	; sprite two (1)
  .byte %00101110
  .byte %00111110
  .byte %00111110
  .byte %01001100
  .byte %00100001
  .byte %00000000
  .byte %00000000