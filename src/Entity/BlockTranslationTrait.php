<?php

namespace Octave\CMSBundle\Entity;

trait BlockTranslationTrait
{
    /**
     * @var string
     * @ORM\Column(type="text", nullable=true)
     */
    private $content;

    /**
     * @var string
     * @ORM\Column(type="string", length=512, nullable=true)
     */
    private $title;

    /**
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * @param string $content
     */
    public function setContent($content)
    {
        $this->content = $content;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
    }
}