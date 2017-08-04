<?php

namespace VideInfra\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use VideInfra\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 *
 * @ORM\Entity()
 * @ORM\Table(
 *     name="vig_page_blocks"
 * )
 */
class Block
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
     * @var string
     * @ORM\Column(type="text")
     */
    private $content;

    /**
     * @var int
     * @ORM\Column(name="`order`", type="integer")
     */
    private $order = 0;

    /**
     * @var Page
     * @ORM\ManyToOne(targetEntity="Page", inversedBy="blocks", cascade={"persist"})
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $page;

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
     * @return Page
     */
    public function getPage()
    {
        return $this->page;
    }

    /**
     * @param Page $page
     */
    public function setPage($page)
    {
        $this->page = $page;
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
}