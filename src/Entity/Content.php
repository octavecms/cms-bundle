<?php

namespace VideInfra\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 *
 * @ORM\Entity(repositoryClass="VideInfra\CMSBundle\Repository\ContentRepository")
 * @ORM\Table(
 *     name="vig_page_content"
 * )
 */
class Content
{
    use ORMBehaviors\Translatable\Translatable;
    use TranslatableEntityTrait;

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var Page
     *
     * @ORM\OneToOne(targetEntity="VideInfra\CMSBundle\Entity\Page", inversedBy="content")
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $page;

    /**
     * @var string
     * @ORM\Column(type="string", length=512, nullable=true)
     */
    private $template;

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
     * @return Page
     */
    public function getPage()
    {
        return $this->page;
    }

    /**
     * @param Page $page
     */
    public function setPage(Page $page)
    {
        $this->page = $page;
    }

    /**
     * @return string
     */
    public function getTemplate()
    {
        return $this->template;
    }

    /**
     * @param string $template
     */
    public function setTemplate($template)
    {
        $this->template = $template;
    }
}