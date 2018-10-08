<?php

namespace Octave\CMSBundle\Entity;

trait BlockTrait
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     * @ORM\Column(type="string", length=255)
     */
    private $type;

    /**
     * @var int
     * @ORM\Column(name="`order`", type="integer")
     */
    private $order = 0;

    /**
     * @var string
     * @ORM\Column(type="text", nullable=true)
     */
    private $content;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @return int
     */
    public function getOrder()
    {
        return $this->order;
    }

    /**
     * @param int $order
     */
    public function setOrder($order)
    {
        $this->order = $order;
    }

    /**
     * @return string
     */
    public function getContent()
    {
        $content = $this->content ? $this->content : $this->translate()->getContent();

        return $content;
    }

    /**
     * @param string $content
     */
    public function setContent($content)
    {
        $this->content = $content;
    }
}