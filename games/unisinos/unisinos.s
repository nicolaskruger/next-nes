anime_state   = $00
player_x      = $01
player_y      = $02
player_info   = $03
sprite        = $04
anime_counter = $05
scroll_x      = $06
pad_1         = $4016

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

star_player:
  lda #$e0
  sta player_y
  lda #$10
  sta player_x
  lda $05
  sta sprite
  lda #1
  sta player_info


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
load_name_table_0:
  lda #$20
  sta $2006
  lda #$00
  sta $2006
  lda #8
  ldx #0
  ldy #0
  @loop_y_name_0:
  ldx #0
  @loop_x_name_0: 
    sta $2007
    inx
    cpx #32
    bne @loop_x_name_0
  iny
  cpy #20
  beq @ldy_ground
    jmp @end_toogle_tile
    @ldy_ground:
    lda #7
  @end_toogle_tile:
  cpy #30
  bne @loop_y_name_0
load_atribut_table_0:
  lda #$23
  sta $2006
  lda #$c0
  sta $2006
  ldx #0
  lda #%01010101
  @loop_atribute_table_0:
    sta $2007
    inx
    cpx 64
    bne @loop_atribute_table_0

load_name_table_1:
  lda #$24
  sta $2006
  lda #$00
  sta $2006
  lda #8
  ldx #0
  ldy #0
  @loop_y_name_1:
  ldx #0
  @loop_x_name_1: 
    sta $2007
    inx
    cpx #32
    bne @loop_x_name_1
  iny
  cpy #20
  beq @ldy_ground_1
    jmp @end_toogle_tile_1
    @ldy_ground_1:
    lda #7
  @end_toogle_tile_1:
  cpy #30
  bne @loop_y_name_1
load_atribut_table_1:
  lda #$27
  sta $2006
  lda #$c0
  sta $2006
  ldx #0
  lda #%01010101
  @loop_atribute_table_1:
    sta $2007
    inx
    cpx 64
    bne @loop_atribute_table_1

enable_rendering:
  lda #%10000000	; Enable NMI
  sta $2000
  lda #%00011110	; Enable Sprites
  sta $2001

forever:
  jmp forever

animate:
  ldx anime_counter
  inx
  stx anime_counter
  cpx #$10
  bne anime_end
  ldx #0
  stx anime_counter
  lda anime_state
  cmp #0
  beq anime_two
anime_one:
  lda #0
  sta anime_state
  jmp anime_end
anime_two:
  lda #1
  sta anime_state
  jmp anime_end
anime_end:
  rts

move:
  lda #1
  sta pad_1
  lda #0
  sta pad_1
  ldx #0
  @loop_control: lda pad_1
    inx
    cpx #6
    bne @loop_control
  lda pad_1
  and #%00000001
  cmp #%00000001
  beq move_left
  jmp end_move_left
  move_left:
    ldx player_x
    dex 
    stx player_x
    lda #%01000001
    sta player_info
    jmp move_end
  end_move_left:
  lda pad_1
  and #%00000001
  cmp #%00000001
  bne move_end
  move_right:
    ldx player_x
    inx 
    stx player_x
    lda #1
    sta player_info
    jmp move_end
  move_end:
  rts

scroll:
  ldx scroll_x
  inx
  stx $2005
  stx scroll_x
  ldx #0
  stx $2005
  rts

nmi:
  jsr animate
  jsr move
  jsr scroll
  ldx #$00 	; Set SPR-RAM address to 0
  stx $2003
@loop:	lda unisinos, x 	; Load the hello message into SPR-RAM
  sta $2004
  inx
  cpx #$28
  bne @loop
render_player:
  lda player_y
  sta $2004
  ldx anime_state
  lda sprite_index, x
  sta $2004
  lda player_info
  sta $2004
  lda player_x
  sta $2004
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

sprite_index:
  .byte $05, $06

palettes:
  ; Background Palette
  .byte $00, $00, $00, $00
  .byte $00, $0d, $08, $00
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

  .byte %00010001	; brick (0) (07)
  .byte %00010001
  .byte %11111111
  .byte %01000100
  .byte %01000100
  .byte %11111111
  .byte %10001000
  .byte %10001000

  .byte %11101110	; brick (1)
  .byte %11101110
  .byte %00000000
  .byte %10111011
  .byte %10111011
  .byte %00000000
  .byte %01110111
  .byte %01110111

  .byte $00, $00, $00, $00, $00, $00, $00, $00 ; empty (08)
  .byte $00, $00, $00, $00, $00, $00, $00, $00

