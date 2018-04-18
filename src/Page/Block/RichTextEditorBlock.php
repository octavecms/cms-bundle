<?php

namespace Octave\CMSBundle\Page\Block;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class RichTextEditorBlock extends AbstractBlock
{
    const NAME = 'rich_text_editor';
    const LABEL = 'Rich Text Editor';

    /** @var string */
    private $template;

    /**
     * RichTextEditorBlock constructor.
     * @param string $template
     */
    public function __construct($template)
    {
        $this->template = $template;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return self::NAME;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return self::LABEL;
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-file-text-o';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return CKEditorType::class;
    }

    /**
     * @return string
     */
    public function getContentTemplate()
    {
        return $this->template;
    }
}